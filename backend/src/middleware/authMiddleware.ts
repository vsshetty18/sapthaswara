/* ============================================================
   SVARAVERSE AI — Authentication Middleware
   Firebase Token Verify | Role Guards | Plan Guards
   ============================================================ */

import { type Request, type Response, type NextFunction } from 'express'
import { verifyIdToken, type DecodedToken } from '../config/firebase'
import { query }  from '../config/db'
import { logger } from '../utils/logger'

// ─── EXTEND EXPRESS REQUEST ──────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?:      AuthenticatedUser
      requestId?: string
    }
  }
}

export interface AuthenticatedUser {
  uid:           string
  email:         string | undefined
  emailVerified: boolean
  displayName:   string | undefined
  role:          UserRole
  plan:          SubscriptionPlan
  dbUser?:       DbUser
}

export interface DbUser {
  id:          string
  uid:         string
  email:       string
  username:    string
  displayName: string
  role:        UserRole
  plan:        SubscriptionPlan
  isActive:    boolean
  photoURL:    string | null
}

// ─── ENUMS (mirrored from types) ─────────────────────────────────────────────

export enum UserRole {
  USER    = 'user',
  CREATOR = 'creator',
  PREMIUM = 'premium',
  ADMIN   = 'admin',
  OWNER   = 'owner',
}

export enum SubscriptionPlan {
  FREE    = 'free',
  BASIC   = 'basic',
  PRO     = 'pro',
  PREMIUM = 'premium',
}

const ROLE_HIERARCHY: UserRole[] = [
  UserRole.USER,
  UserRole.CREATOR,
  UserRole.PREMIUM,
  UserRole.ADMIN,
  UserRole.OWNER,
]

const PLAN_HIERARCHY: SubscriptionPlan[] = [
  SubscriptionPlan.FREE,
  SubscriptionPlan.BASIC,
  SubscriptionPlan.PRO,
  SubscriptionPlan.PREMIUM,
]

// ─── EXTRACT TOKEN ───────────────────────────────────────────────────────────

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // Also check cookie for web app
  if (req.cookies?.token) {
    return req.cookies.token as string
  }
  return null
}

// ─── FETCH USER FROM DB ──────────────────────────────────────────────────────

async function fetchDbUser(uid: string): Promise<DbUser | null> {
  try {
    const result = await query<DbUser>(
      `SELECT id, uid, email, username, display_name AS "displayName",
              role, plan, is_active AS "isActive", photo_url AS "photoURL"
       FROM users
       WHERE uid = $1 AND is_active = true
       LIMIT 1`,
      [uid],
    )
    return result.rows[0] || null
  } catch (err) {
    logger.error('Failed to fetch user from DB:', err)
    return null
  }
}

// ─── MAIN AUTH MIDDLEWARE ────────────────────────────────────────────────────

/**
 * Verifies Firebase ID token and attaches user to req.user
 * Fetches user from PostgreSQL for role/plan info
 */
export async function authenticate(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req)

  if (!token) {
    res.status(401).json({
      success: false,
      error:   'Authentication required. Please provide a Bearer token.',
    })
    return
  }

  try {
    // Verify Firebase token
    const decoded: DecodedToken = await verifyIdToken(token)

    // Fetch user from PostgreSQL for authoritative role/plan
    const dbUser = await fetchDbUser(decoded.uid)

    if (!dbUser) {
      // User exists in Firebase but not in DB yet (first login race condition)
      // Allow with minimal privileges
      req.user = {
        uid:           decoded.uid,
        email:         decoded.email,
        emailVerified: decoded.emailVerified,
        displayName:   decoded.name,
        role:          UserRole.USER,
        plan:          SubscriptionPlan.FREE,
      }
      next()
      return
    }

    if (!dbUser.isActive) {
      res.status(403).json({
        success: false,
        error:   'Your account has been deactivated. Contact support.',
      })
      return
    }

    // Attach full user to request
    req.user = {
      uid:           decoded.uid,
      email:         decoded.email || dbUser.email,
      emailVerified: decoded.emailVerified,
      displayName:   dbUser.displayName,
      role:          dbUser.role as UserRole,
      plan:          dbUser.plan as SubscriptionPlan,
      dbUser,
    }

    next()
  } catch (err) {
    logger.warn('Auth middleware error:', err)
    res.status(401).json({
      success: false,
      error:   'Invalid or expired token. Please sign in again.',
    })
  }
}

// ─── OPTIONAL AUTH ───────────────────────────────────────────────────────────

/**
 * Like authenticate() but does NOT reject unauthenticated requests.
 * Sets req.user if token is valid, otherwise continues without it.
 * Used for public routes that show more data when logged in.
 */
export async function optionalAuth(
  req:  Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req)

  if (!token) {
    next()
    return
  }

  try {
    const decoded = await verifyIdToken(token)
    const dbUser  = await fetchDbUser(decoded.uid)

    if (dbUser?.isActive) {
      req.user = {
        uid:           decoded.uid,
        email:         decoded.email || dbUser.email,
        emailVerified: decoded.emailVerified,
        displayName:   dbUser.displayName,
        role:          dbUser.role as UserRole,
        plan:          dbUser.plan as SubscriptionPlan,
        dbUser,
      }
    }
  } catch {
    // Silently ignore — optional auth
  }

  next()
}

// ─── ROLE GUARD ──────────────────────────────────────────────────────────────

/**
 * Requires a minimum role level.
 * Must be used AFTER authenticate()
 *
 * Usage: router.get('/admin', authenticate, requireRole(UserRole.ADMIN), handler)
 */
export function requireRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' })
      return
    }

    const userLevel = ROLE_HIERARCHY.indexOf(req.user.role)
    const minLevel  = ROLE_HIERARCHY.indexOf(minRole)

    if (userLevel < minLevel) {
      logger.warn(`Role guard blocked: user ${req.user.uid} (${req.user.role}) needs ${minRole}`)
      res.status(403).json({
        success: false,
        error:   `Access denied. ${minRole} role or higher required.`,
      })
      return
    }

    next()
  }
}

// ─── PLAN GUARD ──────────────────────────────────────────────────────────────

/**
 * Requires a minimum subscription plan.
 * Must be used AFTER authenticate()
 */
export function requirePlan(minPlan: SubscriptionPlan) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' })
      return
    }

    const userLevel = PLAN_HIERARCHY.indexOf(req.user.plan)
    const minLevel  = PLAN_HIERARCHY.indexOf(minPlan)

    if (userLevel < minLevel) {
      logger.warn(`Plan guard blocked: user ${req.user.uid} (${req.user.plan}) needs ${minPlan}`)
      res.status(402).json({
        success:     false,
        error:       `This feature requires the ${minPlan} plan or higher.`,
        upgradeUrl:  '/dashboard/settings?tab=billing',
        currentPlan: req.user.plan,
        requiredPlan:minPlan,
      })
      return
    }

    next()
  }
}

// ─── EMAIL VERIFICATION GUARD ────────────────────────────────────────────────

/**
 * Requires verified email address
 */
export function requireEmailVerified(
  req:  Request,
  res:  Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' })
    return
  }

  if (!req.user.emailVerified) {
    res.status(403).json({
      success: false,
      error:   'Please verify your email address to access this feature.',
      code:    'EMAIL_NOT_VERIFIED',
    })
    return
  }

  next()
}

// ─── RESOURCE OWNER GUARD ────────────────────────────────────────────────────

/**
 * Ensures the authenticated user owns the resource.
 * Compares req.user.uid with a userId field from req.params or req.body.
 *
 * Usage: requireOwnership('userId') checks req.params.userId
 */
export function requireOwnership(paramName: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' })
      return
    }

    const resourceUserId = req.params[paramName] || req.body[paramName]

    // Admins and owners can access any resource
    const isAdmin = [UserRole.ADMIN, UserRole.OWNER].includes(req.user.role)

    if (!isAdmin && req.user.uid !== resourceUserId) {
      res.status(403).json({
        success: false,
        error:   'Access denied. You can only access your own resources.',
      })
      return
    }

    next()
  }
}

// ─── DAILY LIMIT GUARD ───────────────────────────────────────────────────────

const AI_DAILY_LIMITS: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]:    5,
  [SubscriptionPlan.BASIC]:   25,
  [SubscriptionPlan.PRO]:     100,
  [SubscriptionPlan.PREMIUM]: Infinity,
}

/**
 * Check AI message daily limit based on subscription plan
 */
export async function checkAILimit(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' })
    return
  }

  const limit = AI_DAILY_LIMITS[req.user.plan]
  if (limit === Infinity) {
    next()
    return
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM ai_messages
       WHERE user_id = $1
         AND DATE(created_at) = $2`,
      [req.user.uid, today],
    )

    const used = parseInt(result.rows[0]?.count || '0', 10)

    if (used >= limit) {
      res.status(429).json({
        success:      false,
        error:        `Daily AI message limit reached (${limit}/day on ${req.user.plan} plan).`,
        used,
        limit,
        upgradeUrl:   '/dashboard/settings?tab=billing',
        resetsAt:     new Date(Date.now() + 86400000).toISOString(),
      })
      return
    }

    next()
  } catch (err) {
    logger.error('AI limit check error:', err)
    next() // Fail open — don't block on DB error
  }
}

// ─── SHORTHAND MIDDLEWARE COMBOS ─────────────────────────────────────────────

/** Authenticate + require admin role */
export const adminOnly = [
  authenticate,
  requireRole(UserRole.ADMIN),
]

/** Authenticate + require owner role */
export const ownerOnly = [
  authenticate,
  requireRole(UserRole.OWNER),
]

/** Authenticate + require pro plan */
export const proOnly = [
  authenticate,
  requirePlan(SubscriptionPlan.PRO),
]

/** Authenticate + require premium plan */
export const premiumOnly = [
  authenticate,
  requirePlan(SubscriptionPlan.PREMIUM),
]
