/* ============================================================
   SVARAVERSE AI — Auth Routes
   Login | Signup | Logout | Refresh | Email Verify
   ============================================================ */

import { Router, type Request, type Response } from 'express'
import { body } from 'express-validator'

import { authenticate }           from '../middleware/authMiddleware'
import { validate, asyncHandler,
         sendSuccess, Errors }     from '../middleware/errorHandler'
import { query, withTransaction }  from '../config/db'
import {
  verifyIdToken, getFirebaseUser,
  setCustomClaims, revokeUserTokens,
  updateFirestoreUser,
}                                  from '../config/firebase'
import { logger }                  from '../utils/logger'

const router = Router()

// ─── VALIDATORS ──────────────────────────────────────────────────────────────

const registerValidators = [
  body('uid')
    .trim().notEmpty().withMessage('Firebase UID is required'),
  body('email')
    .trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('displayName')
    .trim().notEmpty().withMessage('Display name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('username')
    .trim().notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters')
    .matches(/^[a-z][a-z0-9_]+$/).withMessage('Username must start with a letter and contain only lowercase letters, numbers, and underscores'),
]

// ─── POST /auth/register ─────────────────────────────────────────────────────
// Called after Firebase signup to create the DB user record

router.post('/register',
  registerValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { uid, email, displayName, username } = req.body as {
      uid: string; email: string; displayName: string; username: string
    }

    // Verify the Firebase token (UID must match)
    const token = req.headers.authorization?.slice(7)
    if (!token) throw Errors.Unauthorized()

    const decoded = await verifyIdToken(token)
    if (decoded.uid !== uid) throw Errors.Forbidden('UID mismatch')

    // Check username uniqueness
    const existing = await query(
      'SELECT id FROM users WHERE username = $1',
      [username.toLowerCase()],
    )
    if (existing.rowCount && existing.rowCount > 0) {
      throw Errors.Conflict('Username is already taken')
    }

    // Check email uniqueness
    const emailExists = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()],
    )
    if (emailExists.rowCount && emailExists.rowCount > 0) {
      throw Errors.Conflict('An account with this email already exists')
    }

    // Create user in PostgreSQL
    const result = await withTransaction(async (client) => {
      const userResult = await client.query(
        `INSERT INTO users (
          uid, email, username, display_name, role, plan,
          is_email_verified, is_active, country,
          total_songs, total_practice_hours, current_streak,
          longest_streak, total_uploads, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, 'user', 'free',
          $5, true, 'India',
          0, 0, 0, 0, 0,
          NOW(), NOW()
        )
        RETURNING id, uid, email, username, display_name AS "displayName",
                  role, plan, created_at AS "createdAt"`,
        [uid, email.toLowerCase(), username.toLowerCase(), displayName,
         decoded.emailVerified],
      )
      return userResult.rows[0]
    })

    // Set custom claims in Firebase
    await setCustomClaims(uid, { role: 'user', plan: 'free' })

    // Sync to Firestore
    await updateFirestoreUser(uid, {
      uid,
      email:          email.toLowerCase(),
      username:       username.toLowerCase(),
      displayName,
      role:           'user',
      plan:           'free',
      isEmailVerified:decoded.emailVerified,
      totalSongs:     0,
      totalPracticeHours: 0,
      currentStreak:  0,
      longestStreak:  0,
      totalUploads:   0,
    })

    logger.info(`New user registered: ${uid} (@${username})`)

    sendSuccess(res, {
      user: result,
      message: 'Account created successfully',
    }, 'Welcome to SvaraVerse AI! 🎵', 201)
  }),
)

// ─── POST /auth/login ────────────────────────────────────────────────────────
// Syncs login data to DB (last login time, email verification status)

router.post('/login',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!

    // Update last login in DB
    await query(
      `UPDATE users
       SET last_login_at = NOW(),
           is_email_verified = $1,
           updated_at = NOW()
       WHERE uid = $2`,
      [user.emailVerified, user.uid],
    )

    // Fetch full profile
    const result = await query(
      `SELECT id, uid, email, username, display_name AS "displayName",
              photo_url AS "photoURL", bio, role, plan,
              is_email_verified AS "isEmailVerified",
              current_streak AS "currentStreak",
              longest_streak AS "longestStreak",
              total_songs AS "totalSongs",
              total_practice_hours AS "totalPracticeHours",
              total_uploads AS "totalUploads",
              city, state, country, instagram_handle AS "instagramHandle",
              youtube_channel_url AS "youtubeChannelUrl",
              created_at AS "createdAt", last_login_at AS "lastLoginAt"
       FROM users
       WHERE uid = $1`,
      [user.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('User')

    logger.info(`User logged in: ${user.uid}`)

    sendSuccess(res, { user: result.rows[0] }, 'Welcome back! 🎵')
  }),
)

// ─── POST /auth/logout ───────────────────────────────────────────────────────

router.post('/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.user!

    // Revoke all refresh tokens (optional — forces re-login on all devices)
    const revokeAll = req.body.revokeAll === true
    if (revokeAll) {
      await revokeUserTokens(uid)
    }

    await query(
      'UPDATE users SET updated_at = NOW() WHERE uid = $1',
      [uid],
    )

    logger.info(`User logged out: ${uid} (revokeAll: ${revokeAll})`)
    sendSuccess(res, null, 'Logged out successfully')
  }),
)

// ─── GET /auth/me ────────────────────────────────────────────────────────────

router.get('/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT id, uid, email, username, display_name AS "displayName",
              photo_url AS "photoURL", bio, role, plan,
              is_email_verified AS "isEmailVerified",
              phone, city, state, country,
              primary_scale AS "primaryScale",
              genres, instruments,
              instagram_handle AS "instagramHandle",
              youtube_channel_id AS "youtubeChannelId",
              youtube_channel_url AS "youtubeChannelUrl",
              current_streak AS "currentStreak",
              longest_streak AS "longestStreak",
              total_songs AS "totalSongs",
              total_practice_hours AS "totalPracticeHours",
              total_uploads AS "totalUploads",
              last_practice_date AS "lastPracticeDate",
              created_at AS "createdAt",
              last_login_at AS "lastLoginAt"
       FROM users
       WHERE uid = $1`,
      [req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('User profile')

    sendSuccess(res, { user: result.rows[0] })
  }),
)

// ─── POST /auth/forgot-password ──────────────────────────────────────────────

router.post('/forgot-password',
  [body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail()],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body as { email: string }

    // Check if user exists (don't reveal if not)
    const result = await query(
      'SELECT uid FROM users WHERE email = $1',
      [email.toLowerCase()],
    )

    if (result.rowCount && result.rowCount > 0) {
      // Firebase handles sending the reset email via client SDK
      // Backend just logs the request
      logger.info(`Password reset requested for: ${email}`)
    }

    // Always return success (security: don't reveal email existence)
    sendSuccess(res, null, 'If this email exists, a reset link has been sent')
  }),
)

// ─── POST /auth/verify-email ─────────────────────────────────────────────────

router.post('/verify-email',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.user!

    // Check current Firebase status
    const fbUser = await getFirebaseUser(uid)
    if (!fbUser) throw Errors.NotFound('User')

    if (fbUser.emailVerified) {
      // Update DB
      await query(
        'UPDATE users SET is_email_verified = true, updated_at = NOW() WHERE uid = $1',
        [uid],
      )
      await updateFirestoreUser(uid, { isEmailVerified: true })
    }

    sendSuccess(res, {
      emailVerified: fbUser.emailVerified,
    })
  }),
)

// ─── POST /auth/check-username ───────────────────────────────────────────────

router.post('/check-username',
  [body('username').trim().notEmpty().withMessage('Username required')],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.body as { username: string }

    const clean  = username.toLowerCase().trim()
    const valid  = /^[a-z][a-z0-9_]{2,19}$/.test(clean)

    if (!valid) {
      sendSuccess(res, { available: false, reason: 'Invalid format' })
      return
    }

    const result = await query(
      'SELECT 1 FROM users WHERE username = $1',
      [clean],
    )

    sendSuccess(res, {
      available: result.rowCount === 0,
      username:  clean,
    })
  }),
)

// ─── DELETE /auth/account ────────────────────────────────────────────────────

router.delete('/account',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.user!

    // Soft delete — mark inactive
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE users
         SET is_active = false,
             email = CONCAT('deleted_', uid, '_', email),
             username = CONCAT('deleted_', uid),
             updated_at = NOW()
         WHERE uid = $1`,
        [uid],
      )
    })

    // Revoke Firebase tokens
    await revokeUserTokens(uid)

    logger.info(`Account deleted (soft): ${uid}`)
    sendSuccess(res, null, 'Account deleted successfully')
  }),
)

export default router
