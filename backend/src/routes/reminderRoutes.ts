/* ============================================================
   SVARAVERSE AI — Reminder Routes
   CRUD | Recurring | Toggle Active/Push | Upcoming
   ============================================================ */

import { Router, type Request, type Response } from 'express'
import { body, param } from 'express-validator'

import { authenticate }             from '../middleware/authMiddleware'
import { validate, asyncHandler,
         sendSuccess, sendCreated,
         sendNoContent, Errors }    from '../middleware/errorHandler'
import { query, withTransaction,
         buildPagination,
         buildPaginatedResult }     from '../config/db'
import { logger }                   from '../utils/logger'

const router = Router()

// ─── VALIDATORS ──────────────────────────────────────────────────────────────

const REMINDER_TYPES = [
  'practice','live_session','collaboration','competition',
  'studio','recording','birthday','festival','custom',
]

const reminderValidators = [
  body('title')
    .trim().notEmpty().withMessage('Reminder title is required')
    .isLength({ max: 200 }).withMessage('Title too long'),
  body('description')
    .optional().trim()
    .isLength({ max: 500 }).withMessage('Description too long'),
  body('type')
    .isIn(REMINDER_TYPES)
    .withMessage('Invalid reminder type'),
  body('scheduledAt')
    .isISO8601().withMessage('Valid scheduled date/time required'),
  body('isRecurring')
    .optional().isBoolean(),
  body('recurringDays')
    .optional()
    .isArray().withMessage('recurringDays must be an array')
    .custom((val: number[]) => {
      if (!Array.isArray(val)) return true
      return val.every(d => d >= 0 && d <= 6)
    }).withMessage('Days must be 0 (Sun) to 6 (Sat)'),
  body('isPushEnabled')
    .optional().isBoolean(),
  body('relatedSongId')
    .optional().trim(),
]

// ─── GET /reminders ──────────────────────────────────────────────────────────

router.get('/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid
    const {
      page    = '1',
      limit   = '20',
      type,
      active,
    } = req.query as Record<string, string>

    const { offset, limit: lim } = buildPagination({
      page:  parseInt(page),
      limit: parseInt(limit),
    })

    const conditions: string[] = ['r.user_id = $1']
    const params: unknown[]    = [uid]
    let   idx                  = 2

    if (type) {
      conditions.push(`r.type = $${idx}`)
      params.push(type); idx++
    }

    if (active !== undefined) {
      conditions.push(`r.is_active = $${idx}`)
      params.push(active === 'true'); idx++
    }

    const where = `WHERE ${conditions.join(' AND ')}`

    // Count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM reminders r ${where}`,
      params,
    )
    const total = parseInt(countResult.rows[0]?.count || '0', 10)

    // Data
    const result = await query(
      `SELECT
         r.id, r.user_id AS "userId",
         r.title, r.description, r.type,
         r.scheduled_at AS "scheduledAt",
         r.is_recurring AS "isRecurring",
         r.recurring_days AS "recurringDays",
         r.is_active AS "isActive",
         r.is_push_enabled AS "isPushEnabled",
         r.related_song_id AS "relatedSongId",
         r.created_at AS "createdAt",
         r.updated_at AS "updatedAt",
         s.title AS "songTitle"
       FROM reminders r
       LEFT JOIN songs s ON s.id = r.related_song_id::uuid
       ${where}
       ORDER BY r.scheduled_at ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, lim, offset],
    )

    res.json({
      success: true,
      ...buildPaginatedResult(result.rows, total, {
        page:  parseInt(page),
        limit: lim,
      }),
    })
  }),
)

// ─── GET /reminders/upcoming ─────────────────────────────────────────────────

router.get('/upcoming',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid   = req.user!.uid
    const days  = parseInt((req.query.days as string) || '7')
    const limit = Math.min(parseInt((req.query.limit as string) || '10'), 50)

    const result = await query(
      `SELECT
         r.id, r.title, r.description, r.type,
         r.scheduled_at AS "scheduledAt",
         r.is_recurring AS "isRecurring",
         r.recurring_days AS "recurringDays",
         r.is_push_enabled AS "isPushEnabled",
         s.title AS "songTitle"
       FROM reminders r
       LEFT JOIN songs s ON s.id = r.related_song_id::uuid
       WHERE r.user_id = $1
         AND r.is_active = true
         AND (
           (r.is_recurring = false AND r.scheduled_at BETWEEN NOW() AND NOW() + INTERVAL '${days} days')
           OR r.is_recurring = true
         )
       ORDER BY r.scheduled_at ASC
       LIMIT $2`,
      [uid, limit],
    )

    sendSuccess(res, { upcoming: result.rows, daysAhead: days })
  }),
)

// ─── GET /reminders/:id ──────────────────────────────────────────────────────

router.get('/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT
         r.id, r.user_id AS "userId",
         r.title, r.description, r.type,
         r.scheduled_at AS "scheduledAt",
         r.is_recurring AS "isRecurring",
         r.recurring_days AS "recurringDays",
         r.is_active AS "isActive",
         r.is_push_enabled AS "isPushEnabled",
         r.related_song_id AS "relatedSongId",
         r.created_at AS "createdAt",
         s.title AS "songTitle", s.artist AS "songArtist"
       FROM reminders r
       LEFT JOIN songs s ON s.id = r.related_song_id::uuid
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Reminder')

    sendSuccess(res, { reminder: result.rows[0] })
  }),
)

// ─── POST /reminders ─────────────────────────────────────────────────────────

router.post('/',
  authenticate,
  reminderValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      title, description, type, scheduledAt,
      isRecurring, recurringDays, isPushEnabled, relatedSongId,
    } = req.body as {
      title: string; description?: string; type: string
      scheduledAt: string; isRecurring?: boolean
      recurringDays?: number[]; isPushEnabled?: boolean
      relatedSongId?: string
    }

    const uid = req.user!.uid

    // Validate: recurring reminders must have days
    if (isRecurring && (!recurringDays || recurringDays.length === 0)) {
      throw Errors.BadRequest('Recurring reminders must specify at least one day')
    }

    const result = await query(
      `INSERT INTO reminders (
         user_id, title, description, type,
         scheduled_at, is_recurring, recurring_days,
         is_active, is_push_enabled, related_song_id,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         true, $8, $9, NOW(), NOW()
       )
       RETURNING
         id, user_id AS "userId", title, description, type,
         scheduled_at AS "scheduledAt",
         is_recurring AS "isRecurring",
         recurring_days AS "recurringDays",
         is_active AS "isActive",
         is_push_enabled AS "isPushEnabled",
         created_at AS "createdAt"`,
      [
        uid, title, description || null, type,
        scheduledAt, isRecurring || false,
        JSON.stringify(recurringDays || []),
        isPushEnabled ?? true,
        relatedSongId || null,
      ],
    )

    logger.info(`Reminder created: ${result.rows[0].id} for ${uid}`)
    sendCreated(res, { reminder: result.rows[0] }, 'Reminder set! 🔔')
  }),
)

// ─── PUT /reminders/:id ──────────────────────────────────────────────────────

router.put('/:id',
  authenticate,
  reminderValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid
    const {
      title, description, type, scheduledAt,
      isRecurring, recurringDays, isPushEnabled, relatedSongId,
    } = req.body

    if (isRecurring && (!recurringDays || recurringDays.length === 0)) {
      throw Errors.BadRequest('Recurring reminders must specify at least one day')
    }

    const result = await query(
      `UPDATE reminders
       SET title           = $1,
           description     = $2,
           type            = $3,
           scheduled_at    = $4,
           is_recurring    = $5,
           recurring_days  = $6,
           is_push_enabled = $7,
           related_song_id = $8,
           updated_at      = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING
         id, title, type,
         scheduled_at AS "scheduledAt",
         is_recurring AS "isRecurring",
         is_active AS "isActive",
         updated_at AS "updatedAt"`,
      [
        title, description || null, type, scheduledAt,
        isRecurring || false,
        JSON.stringify(recurringDays || []),
        isPushEnabled ?? true,
        relatedSongId || null,
        req.params.id, uid,
      ],
    )

    if (!result.rows[0]) throw Errors.NotFound('Reminder')

    sendSuccess(res, { reminder: result.rows[0] }, 'Reminder updated')
  }),
)

// ─── DELETE /reminders/:id ───────────────────────────────────────────────────

router.delete('/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Reminder')

    sendNoContent(res)
  }),
)

// ─── POST /reminders/:id/toggle ──────────────────────────────────────────────

router.post('/:id/toggle',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { field = 'active' } = req.query as { field?: string }

    const column = field === 'push' ? 'is_push_enabled' : 'is_active'

    const result = await query(
      `UPDATE reminders
       SET ${column} = NOT ${column}, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, is_active AS "isActive", is_push_enabled AS "isPushEnabled"`,
      [req.params.id, req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Reminder')

    const r = result.rows[0]
    sendSuccess(res, {
      id:            r.id,
      isActive:      r.isActive,
      isPushEnabled: r.isPushEnabled,
    })
  }),
)

// ─── GET /reminders/stats/summary ────────────────────────────────────────────

router.get('/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid

    const result = await query(
      `SELECT
         COUNT(*)                                        AS "total",
         COUNT(*) FILTER (WHERE is_active = true)       AS "active",
         COUNT(*) FILTER (WHERE is_recurring = true)    AS "recurring",
         COUNT(*) FILTER (WHERE
           is_active = true
           AND is_recurring = false
           AND scheduled_at > NOW()
           AND scheduled_at <= NOW() + INTERVAL '7 days'
         )                                              AS "upcoming7Days"
       FROM reminders
       WHERE user_id = $1`,
      [uid],
    )

    sendSuccess(res, { stats: result.rows[0] })
  }),
)

export default router
