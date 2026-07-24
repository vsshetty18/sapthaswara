/* ============================================================
   SVARAVERSE AI — User Routes
   Profile | Settings | Follow/Unfollow | Public Profiles
   ============================================================ */

import { Router, type Request, type Response } from 'express'
import { body, param } from 'express-validator'

import { authenticate, optionalAuth } from '../middleware/authMiddleware'
import { validate, asyncHandler,
         sendSuccess, sendNoContent,
         Errors }                     from '../middleware/errorHandler'
import { query, withTransaction,
         buildPagination,
         buildPaginatedResult }       from '../config/db'
import { updateFirestoreUser }        from '../config/firebase'
import { logger }                     from '../utils/logger'

const router = Router()

// ─── VALIDATORS ──────────────────────────────────────────────────────────────

const profileValidators = [
  body('displayName')
    .optional().trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('username')
    .optional().trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters')
    .matches(/^[a-z][a-z0-9_]+$/).withMessage('Invalid username format'),
  body('bio')
    .optional().trim()
    .isLength({ max: 300 }).withMessage('Bio max 300 characters'),
  body('phone')
    .optional().trim()
    .isMobilePhone('any').withMessage('Invalid phone number'),
  body('city')
    .optional().trim()
    .isLength({ max: 100 }),
  body('state')
    .optional().trim()
    .isLength({ max: 100 }),
  body('primaryScale')
    .optional().trim()
    .isIn(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','']),
  body('instagramHandle')
    .optional().trim()
    .isLength({ max: 50 }),
  body('youtubeChannelUrl')
    .optional().trim()
    .isURL({ require_protocol: true }).withMessage('Invalid YouTube URL')
    .optional({ checkFalsy: true }),
]

// ─── GET /users/profile ──────────────────────────────────────────────────────

router.get('/profile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT
         u.id, u.uid, u.email, u.username,
         u.display_name AS "displayName",
         u.photo_url AS "photoURL",
         u.bio, u.phone, u.city, u.state, u.country,
         u.role, u.plan,
         u.is_email_verified AS "isEmailVerified",
         u.primary_scale AS "primaryScale",
         u.genres, u.instruments,
         u.instagram_handle AS "instagramHandle",
         u.youtube_channel_id AS "youtubeChannelId",
         u.youtube_channel_url AS "youtubeChannelUrl",
         u.current_streak AS "currentStreak",
         u.longest_streak AS "longestStreak",
         u.total_songs AS "totalSongs",
         u.total_practice_hours AS "totalPracticeHours",
         u.total_uploads AS "totalUploads",
         u.last_practice_date AS "lastPracticeDate",
         u.fcm_token AS "fcmToken",
         u.created_at AS "createdAt",
         u.last_login_at AS "lastLoginAt",
         (SELECT COUNT(*) FROM follows WHERE follower_id = u.uid) AS "followingCount",
         (SELECT COUNT(*) FROM follows WHERE following_id = u.uid) AS "followersCount"
       FROM users u
       WHERE u.uid = $1`,
      [req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('User profile')

    sendSuccess(res, { user: result.rows[0] })
  }),
)

// ─── PUT /users/update ───────────────────────────────────────────────────────

router.put('/update',
  authenticate,
  profileValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid
    const {
      displayName, username, bio, phone,
      city, state, primaryScale,
      genres, instruments,
      instagramHandle, youtubeChannelUrl,
    } = req.body as {
      displayName?: string; username?: string; bio?: string
      phone?: string; city?: string; state?: string
      primaryScale?: string; genres?: string[]; instruments?: string[]
      instagramHandle?: string; youtubeChannelUrl?: string
    }

    // Check username uniqueness if being changed
    if (username) {
      const existing = await query(
        'SELECT uid FROM users WHERE username = $1 AND uid != $2',
        [username.toLowerCase(), uid],
      )
      if (existing.rows[0]) throw Errors.Conflict('Username already taken')
    }

    const result = await query(
      `UPDATE users SET
         display_name        = COALESCE($1,  display_name),
         username            = COALESCE($2,  username),
         bio                 = COALESCE($3,  bio),
         phone               = COALESCE($4,  phone),
         city                = COALESCE($5,  city),
         state               = COALESCE($6,  state),
         primary_scale       = COALESCE($7,  primary_scale),
         genres              = COALESCE($8,  genres),
         instruments         = COALESCE($9,  instruments),
         instagram_handle    = COALESCE($10, instagram_handle),
         youtube_channel_url = COALESCE($11, youtube_channel_url),
         updated_at          = NOW()
       WHERE uid = $12
       RETURNING
         uid, display_name AS "displayName", username,
         bio, phone, city, state, primary_scale AS "primaryScale",
         genres, instruments,
         instagram_handle AS "instagramHandle",
         youtube_channel_url AS "youtubeChannelUrl",
         updated_at AS "updatedAt"`,
      [
        displayName     || null,
        username?.toLowerCase() || null,
        bio             || null,
        phone           || null,
        city            || null,
        state           || null,
        primaryScale    || null,
        genres          ? JSON.stringify(genres)      : null,
        instruments     ? JSON.stringify(instruments) : null,
        instagramHandle || null,
        youtubeChannelUrl || null,
        uid,
      ],
    )

    // Sync to Firestore
    const updated: Record<string, unknown> = {}
    if (displayName)      updated.displayName      = displayName
    if (username)         updated.username         = username.toLowerCase()
    if (bio !== undefined)updated.bio              = bio
    if (city)             updated.city             = city

    if (Object.keys(updated).length > 0) {
      await updateFirestoreUser(uid, updated).catch(() => {})
    }

    logger.info(`Profile updated: ${uid}`)
    sendSuccess(res, { user: result.rows[0] }, 'Profile updated successfully')
  }),
)

// ─── PUT /users/settings ─────────────────────────────────────────────────────

router.put('/settings',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid
    const { theme, language, notifications, privacy, display } = req.body

    // Upsert into user_settings table
    await query(
      `INSERT INTO user_settings (user_id, theme, language, notifications, privacy, display, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         theme         = COALESCE($2, user_settings.theme),
         language      = COALESCE($3, user_settings.language),
         notifications = COALESCE($4, user_settings.notifications),
         privacy       = COALESCE($5, user_settings.privacy),
         display       = COALESCE($6, user_settings.display),
         updated_at    = NOW()`,
      [
        uid,
        theme         || null,
        language      || null,
        notifications ? JSON.stringify(notifications) : null,
        privacy       ? JSON.stringify(privacy)       : null,
        display       ? JSON.stringify(display)       : null,
      ],
    )

    sendSuccess(res, null, 'Settings saved')
  }),
)

// ─── GET /users/settings ─────────────────────────────────────────────────────

router.get('/settings',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT theme, language, notifications, privacy, display
       FROM user_settings
       WHERE user_id = $1`,
      [req.user!.uid],
    )

    sendSuccess(res, {
      settings: result.rows[0] || {
        theme:    'system',
        language: 'en',
        notifications: {
          push: true, email: true,
          practiceReminder: true, milestones: true,
          community: false, aiInsights: true,
        },
        privacy: {
          profilePublic: true, songsPublic: false,
          analyticsPublic: false, showOnLeaderboard: true,
        },
        display: { compactMode: false, showStreak: true, showProgress: true },
      },
    })
  }),
)

// ─── POST /users/avatar ──────────────────────────────────────────────────────

router.post('/avatar',
  authenticate,
  [body('photoURL').trim().isURL().withMessage('Valid URL required')],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { photoURL } = req.body as { photoURL: string }
    const uid = req.user!.uid

    await query(
      'UPDATE users SET photo_url = $1, updated_at = NOW() WHERE uid = $2',
      [photoURL, uid],
    )

    await updateFirestoreUser(uid, { photoURL }).catch(() => {})

    sendSuccess(res, { photoURL }, 'Avatar updated')
  }),
)

// ─── GET /users/:username — Public profile ────────────────────────────────

router.get('/:username',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params
    const viewerUid   = req.user?.uid

    const result = await query(
      `SELECT
         u.uid, u.username,
         u.display_name AS "displayName",
         u.photo_url AS "photoURL",
         u.bio, u.city, u.country,
         u.role, u.plan,
         u.genres, u.instruments,
         u.total_songs AS "totalSongs",
         u.current_streak AS "currentStreak",
         u.total_uploads AS "totalUploads",
         u.created_at AS "createdAt",
         (SELECT COUNT(*) FROM follows WHERE follower_id  = u.uid) AS "followingCount",
         (SELECT COUNT(*) FROM follows WHERE following_id = u.uid) AS "followersCount",
         ${viewerUid ? `
         EXISTS(
           SELECT 1 FROM follows
           WHERE follower_id = '${viewerUid}'
             AND following_id = u.uid
         ) AS "isFollowing"` : 'false AS "isFollowing"'}
       FROM users u
       WHERE u.username = $1 AND u.is_active = true`,
      [username.toLowerCase()],
    )

    if (!result.rows[0]) throw Errors.NotFound('User')

    // Only return public songs
    const songs = await query(
      `SELECT id, title, artist, cover_url AS "coverUrl",
              language, difficulty, status,
              practice_count AS "practiceCount"
       FROM songs
       WHERE user_id = $1 AND is_public = true
       ORDER BY created_at DESC LIMIT 6`,
      [result.rows[0].uid],
    )

    sendSuccess(res, {
      user:  result.rows[0],
      songs: songs.rows,
    })
  }),
)

// ─── POST /users/:id/follow ───────────────────────────────────────────────

router.post('/:id/follow',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const followerUid  = req.user!.uid
    const followingUid = req.params.id

    if (followerUid === followingUid) {
      throw Errors.BadRequest('You cannot follow yourself')
    }

    // Check target user exists
    const target = await query(
      'SELECT uid FROM users WHERE uid = $1 AND is_active = true',
      [followingUid],
    )
    if (!target.rows[0]) throw Errors.NotFound('User')

    // Insert follow (ignore if already following)
    await query(
      `INSERT INTO follows (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
      [followerUid, followingUid],
    )

    sendSuccess(res, { following: true }, 'Now following!')
  }),
)

// ─── DELETE /users/:id/unfollow ───────────────────────────────────────────

router.delete('/:id/unfollow',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.user!.uid, req.params.id],
    )

    sendSuccess(res, { following: false }, 'Unfollowed')
  }),
)

// ─── GET /users/export/data ───────────────────────────────────────────────

router.get('/export/data',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid

    const [userResult, songsResult, analyticsResult] = await Promise.all([
      query('SELECT * FROM users WHERE uid = $1', [uid]),
      query('SELECT * FROM songs WHERE user_id = $1 ORDER BY created_at', [uid]),
      query(
        'SELECT * FROM daily_analytics WHERE user_id = $1 ORDER BY date',
        [uid],
      ),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      user:       userResult.rows[0],
      songs:      songsResult.rows,
      analytics:  analyticsResult.rows,
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename="svaraverse-data.json"')
    res.status(200).json(exportData)
  }),
)

export default router
