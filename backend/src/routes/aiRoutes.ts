/* ============================================================
   SVARAVERSE AI — Song Routes
   CRUD | Upload | Practice Log | Favourite | Filter/Sort
   ============================================================ */

import { Router, type Request, type Response } from 'express'
import { body, query as qv, param } from 'express-validator'
import multer from 'multer'

import { authenticate }              from '../middleware/authMiddleware'
import { validate, asyncHandler,
         sendSuccess, sendCreated,
         sendNoContent, Errors }     from '../middleware/errorHandler'
import { query, withTransaction,
         buildPagination,
         buildPaginatedResult }      from '../config/db'
import { logger }                    from '../utils/logger'

const router = Router()

// ─── MULTER (memory storage for Firebase upload) ──────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,   // 50MB for audio
  },
  fileFilter: (_req, file, cb) => {
    const ALLOWED_AUDIO = ['audio/mpeg', 'audio/wav', 'audio/mp4',
                           'audio/ogg', 'audio/flac', 'audio/x-flac']
    const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp']
    const allowed = [...ALLOWED_AUDIO, ...ALLOWED_IMAGE]

    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`))
    }
  },
})

// ─── VALIDATORS ──────────────────────────────────────────────────────────────

const songValidators = [
  body('title')
    .trim().notEmpty().withMessage('Song title is required')
    .isLength({ max: 200 }).withMessage('Title too long'),
  body('artist')
    .trim().notEmpty().withMessage('Artist name is required')
    .isLength({ max: 100 }).withMessage('Artist name too long'),
  body('language')
    .optional()
    .isIn(['hindi','english','marathi','bengali','tamil','telugu',
           'kannada','gujarati','punjabi','malayalam','bhojpuri',
           'rajasthani','other'])
    .withMessage('Invalid language'),
  body('difficulty')
    .optional()
    .isIn(['beginner','intermediate','advanced','expert'])
    .withMessage('Invalid difficulty'),
  body('mood')
    .optional()
    .isIn(['happy','sad','romantic','devotional','energetic',
           'calm','patriotic','classical','folk','festive'])
    .withMessage('Invalid mood'),
  body('scale')
    .optional().trim()
    .isIn(['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'])
    .withMessage('Invalid scale'),
  body('status')
    .optional()
    .isArray().withMessage('Status must be an array'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('isPublic')
    .optional().isBoolean(),
  body('isFavourite')
    .optional().isBoolean(),
]

const practiceValidators = [
  body('durationMin')
    .isInt({ min: 1, max: 480 })
    .withMessage('Practice duration must be 1–480 minutes'),
]

// ─── GET /songs — List all songs for authenticated user ────────────────────

router.get('/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page       = '1',
      limit      = '24',
      search,
      language,
      mood,
      difficulty,
      status,
      isFavourite,
      sortBy     = 'created_at',
      sortOrder  = 'desc',
    } = req.query as Record<string, string>

    const { offset, limit: lim } = buildPagination({
      page:  parseInt(page),
      limit: parseInt(limit),
    })

    const ALLOWED_SORT = ['title', 'created_at', 'last_practiced_at',
                          'practice_count', 'updated_at']
    const safeSort     = ALLOWED_SORT.includes(sortBy) ? sortBy : 'created_at'
    const safeOrder    = sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Build dynamic WHERE conditions
    const conditions: string[] = ['s.user_id = $1']
    const params: unknown[]    = [req.user!.uid]
    let   idx                  = 2

    if (search) {
      conditions.push(
        `(LOWER(s.title) LIKE $${idx} OR LOWER(s.artist) LIKE $${idx}
          OR LOWER(s.movie) LIKE $${idx})`,
      )
      params.push(`%${search.toLowerCase()}%`)
      idx++
    }

    if (language) {
      conditions.push(`s.language = $${idx}`)
      params.push(language); idx++
    }

    if (mood) {
      conditions.push(`s.mood = $${idx}`)
      params.push(mood); idx++
    }

    if (difficulty) {
      conditions.push(`s.difficulty = $${idx}`)
      params.push(difficulty); idx++
    }

    if (status) {
      conditions.push(`$${idx} = ANY(s.status)`)
      params.push(status); idx++
    }

    if (isFavourite === 'true') {
      conditions.push('s.is_favourite = true')
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`

    // Count query
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM songs s ${whereClause}`,
      params,
    )
    const total = parseInt(countResult.rows[0]?.count || '0', 10)

    // Data query
    const dataResult = await query(
      `SELECT s.id, s.user_id AS "userId", s.title, s.artist,
              s.composer, s.lyricist, s.movie, s.language, s.mood,
              s.scale, s.difficulty, s.status, s.tags, s.lyrics,
              s.notes, s.audio_url AS "audioUrl",
              s.cover_url AS "coverUrl",
              s.practice_count AS "practiceCount",
              s.total_practice_min AS "totalPracticeMin",
              s.last_practiced_at AS "lastPracticedAt",
              s.is_favourite AS "isFavourite",
              s.is_public AS "isPublic",
              s.created_at AS "createdAt",
              s.updated_at AS "updatedAt"
       FROM songs s
       ${whereClause}
       ORDER BY s.${safeSort} ${safeOrder}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, lim, offset],
    )

    res.json({
      success: true,
      ...buildPaginatedResult(dataResult.rows, total, {
        page:  parseInt(page),
        limit: lim,
      }),
    })
  }),
)

// ─── POST /songs — Create a new song ──────────────────────────────────────

router.post('/',
  authenticate,
  songValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      title, artist, composer, lyricist, movie, language,
      mood, scale, difficulty, status, tags, lyrics, notes,
      isPublic, isFavourite,
    } = req.body as {
      title: string; artist: string; composer?: string; lyricist?: string
      movie?: string; language?: string; mood?: string; scale?: string
      difficulty?: string; status?: string[]; tags?: string[]
      lyrics?: string; notes?: string; isPublic?: boolean; isFavourite?: boolean
    }

    const result = await query(
      `INSERT INTO songs (
         user_id, title, artist, composer, lyricist, movie,
         language, mood, scale, difficulty, status, tags,
         lyrics, notes, is_public, is_favourite,
         practice_count, total_practice_min,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
         $11, $12, $13, $14, $15, $16, 0, 0, NOW(), NOW()
       )
       RETURNING id, user_id AS "userId", title, artist,
                 composer, lyricist, movie, language, mood,
                 scale, difficulty, status, tags,
                 is_favourite AS "isFavourite",
                 is_public AS "isPublic",
                 practice_count AS "practiceCount",
                 created_at AS "createdAt"`,
      [
        req.user!.uid, title, artist, composer || null, lyricist || null,
        movie || null, language || 'hindi', mood || null, scale || null,
        difficulty || 'intermediate',
        JSON.stringify(status || []),
        JSON.stringify(tags || []),
        lyrics || null, notes || null,
        isPublic ?? false, isFavourite ?? false,
      ],
    )

    // Increment user's total songs count
    await query(
      'UPDATE users SET total_songs = total_songs + 1, updated_at = NOW() WHERE uid = $1',
      [req.user!.uid],
    )

    logger.info(`Song created: ${result.rows[0].id} by ${req.user!.uid}`)
    sendCreated(res, { song: result.rows[0] }, 'Song added to library! 🎵')
  }),
)

// ─── GET /songs/:id — Get single song ─────────────────────────────────────

router.get('/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT s.*, u.display_name AS "ownerName", u.username AS "ownerUsername"
       FROM songs s
       JOIN users u ON u.uid = s.user_id
       WHERE s.id = $1
         AND (s.user_id = $2 OR s.is_public = true)`,
      [req.params.id, req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Song')

    sendSuccess(res, { song: result.rows[0] })
  }),
)

// ─── PUT /songs/:id — Update song ─────────────────────────────────────────

router.put('/:id',
  authenticate,
  songValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    // Verify ownership
    const owned = await query(
      'SELECT id FROM songs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.uid],
    )
    if (!owned.rows[0]) throw Errors.NotFound('Song')

    const {
      title, artist, composer, lyricist, movie, language,
      mood, scale, difficulty, status, tags, lyrics, notes,
      isPublic, isFavourite,
    } = req.body

    const result = await query(
      `UPDATE songs
       SET title = $1, artist = $2, composer = $3, lyricist = $4,
           movie = $5, language = $6, mood = $7, scale = $8,
           difficulty = $9, status = $10, tags = $11,
           lyrics = $12, notes = $13,
           is_public = $14, is_favourite = $15,
           updated_at = NOW()
       WHERE id = $16 AND user_id = $17
       RETURNING id, title, artist, language, difficulty,
                 status, is_favourite AS "isFavourite",
                 updated_at AS "updatedAt"`,
      [
        title, artist, composer || null, lyricist || null,
        movie || null, language || 'hindi', mood || null, scale || null,
        difficulty || 'intermediate',
        JSON.stringify(status || []),
        JSON.stringify(tags || []),
        lyrics || null, notes || null,
        isPublic ?? false, isFavourite ?? false,
        req.params.id, req.user!.uid,
      ],
    )

    sendSuccess(res, { song: result.rows[0] }, 'Song updated successfully')
  }),
)

// ─── DELETE /songs/:id ─────────────────────────────────────────────────────

router.delete('/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      'DELETE FROM songs WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Song')

    // Decrement user's total songs count
    await query(
      'UPDATE users SET total_songs = GREATEST(total_songs - 1, 0), updated_at = NOW() WHERE uid = $1',
      [req.user!.uid],
    )

    sendNoContent(res)
  }),
)

// ─── POST /songs/:id/favourite — Toggle favourite ─────────────────────────

router.post('/:id/favourite',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `UPDATE songs
       SET is_favourite = NOT is_favourite, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, is_favourite AS "isFavourite"`,
      [req.params.id, req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Song')

    sendSuccess(res, {
      isFavourite: result.rows[0].isFavourite,
    })
  }),
)

// ─── POST /songs/:id/practice — Log practice session ──────────────────────

router.post('/:id/practice',
  authenticate,
  practiceValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { durationMin } = req.body as { durationMin: number }
    const today = new Date().toISOString().split('T')[0]

    await withTransaction(async (client) => {
      // Update song practice stats
      await client.query(
        `UPDATE songs
         SET practice_count     = practice_count + 1,
             total_practice_min = total_practice_min + $1,
             last_practiced_at  = NOW(),
             updated_at         = NOW()
         WHERE id = $2 AND user_id = $3`,
        [durationMin, req.params.id, req.user!.uid],
      )

      // Update user practice hours
      await client.query(
        `UPDATE users
         SET total_practice_hours = total_practice_hours + $1,
             last_practice_date   = $2,
             updated_at           = NOW()
         WHERE uid = $3`,
        [durationMin / 60, today, req.user!.uid],
      )

      // Upsert daily analytics record
      await client.query(
        `INSERT INTO daily_analytics (user_id, date, practice_minutes)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, date)
         DO UPDATE SET practice_minutes = daily_analytics.practice_minutes + $3,
                       updated_at = NOW()`,
        [req.user!.uid, today, durationMin],
      )

      // Log practice session
      await client.query(
        `INSERT INTO practice_sessions (user_id, song_id, duration_min, practiced_at)
         VALUES ($1, $2, $3, NOW())`,
        [req.user!.uid, req.params.id, durationMin],
      )
    })

    // Update streak (separate from transaction — non-critical)
    await updateStreak(req.user!.uid)

    logger.info(`Practice logged: ${req.params.id} for ${durationMin}min by ${req.user!.uid}`)

    sendSuccess(res, {
      durationMin,
      message: 'Practice session logged! Keep it up 🔥',
    })
  }),
)

// ─── STREAK HELPER ───────────────────────────────────────────────────────────

async function updateStreak(uid: string): Promise<void> {
  try {
    const result = await query(
      'SELECT current_streak, longest_streak, last_practice_date FROM users WHERE uid = $1',
      [uid],
    )
    if (!result.rows[0]) return

    const { current_streak, longest_streak, last_practice_date } = result.rows[0]
    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (last_practice_date === today) return // Already updated today

    const newStreak = last_practice_date === yesterday ? current_streak + 1 : 1
    const newLongest= Math.max(newStreak, longest_streak)

    await query(
      `UPDATE users
       SET current_streak    = $1,
           longest_streak    = $2,
           last_practice_date= $3,
           updated_at        = NOW()
       WHERE uid = $4`,
      [newStreak, newLongest, today, uid],
    )
  } catch (err) {
    logger.error('Streak update error:', err)
  }
}

// ─── GET /songs/stats/summary ─────────────────────────────────────────────

router.get('/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT
         COUNT(*)                                        AS "totalSongs",
         COUNT(*) FILTER (WHERE 'practiced' = ANY(status)) AS "practiced",
         COUNT(*) FILTER (WHERE 'recorded'  = ANY(status)) AS "recorded",
         COUNT(*) FILTER (WHERE 'posted'    = ANY(status)) AS "posted",
         COUNT(*) FILTER (WHERE is_favourite = true)       AS "favourites",
         SUM(practice_count)                             AS "totalPracticeCount",
         SUM(total_practice_min)                         AS "totalPracticeMin",
         COUNT(DISTINCT language)                        AS "languagesCount"
       FROM songs
       WHERE user_id = $1`,
      [req.user!.uid],
    )

    sendSuccess(res, { stats: result.rows[0] })
  }),
)

export default router
