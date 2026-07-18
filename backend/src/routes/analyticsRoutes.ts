/* ============================================================
   SVARAVERSE AI — Analytics Routes
   Heatmap | Growth | Performance Score | Reports | Summary
   ============================================================ */

import { Router, type Request, type Response } from 'express'
import { query as qv } from 'express-validator'

import { authenticate }          from '../middleware/authMiddleware'
import { validate, asyncHandler,
         sendSuccess, Errors }   from '../middleware/errorHandler'
import { query }                 from '../config/db'
import { PERFORMANCE_SCORE_WEIGHTS } from './analyticsHelpers'

const router = Router()

// ─── GET /analytics/summary ──────────────────────────────────────────────────

router.get('/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid

    const [userResult, weekResult, monthResult] = await Promise.all([
      // User base stats
      query(
        `SELECT current_streak AS "currentStreak",
                longest_streak AS "longestStreak",
                total_songs AS "totalSongs",
                total_practice_hours AS "totalPracticeHours",
                total_uploads AS "totalUploads"
         FROM users WHERE uid = $1`,
        [uid],
      ),

      // This week's practice
      query(
        `SELECT COALESCE(SUM(practice_minutes), 0) AS "weeklyMinutes",
                COUNT(*) FILTER (WHERE practice_minutes > 0) AS "activeDays"
         FROM daily_analytics
         WHERE user_id = $1
           AND date >= DATE_TRUNC('week', NOW())`,
        [uid],
      ),

      // This month's stats
      query(
        `SELECT COALESCE(SUM(practice_minutes), 0) AS "monthlyMinutes",
                COUNT(*) FILTER (WHERE practice_minutes > 0) AS "activeMonthDays"
         FROM daily_analytics
         WHERE user_id = $1
           AND date >= DATE_TRUNC('month', NOW())`,
        [uid],
      ),
    ])

    const user  = userResult.rows[0]  || {}
    const week  = weekResult.rows[0]  || {}
    const month = monthResult.rows[0] || {}

    // Calculate performance score
    const streakScore      = Math.min((user.currentStreak || 0) / 30 * 100, 100)
    const consistencyScore = Math.min((week.activeDays || 0) / 7 * 100, 100)
    const productivityScore= Math.min((user.totalSongs || 0) / 50 * 100, 100)
    const growthScore      = 70 // Placeholder — real app pulls from Instagram/YouTube

    const performanceScore = Math.round(
      streakScore       * 0.35 +
      consistencyScore  * 0.25 +
      productivityScore * 0.20 +
      growthScore       * 0.20,
    )

    sendSuccess(res, {
      summary: {
        // Practice
        currentStreak:        user.currentStreak        || 0,
        longestStreak:        user.longestStreak        || 0,
        totalPracticeHours:   user.totalPracticeHours   || 0,
        weeklyPracticeMinutes:parseInt(week.weeklyMinutes)   || 0,
        monthlyPracticeMinutes:parseInt(month.monthlyMinutes) || 0,
        weekActiveDays:       parseInt(week.activeDays)  || 0,
        monthActiveDays:      parseInt(month.activeMonthDays)|| 0,

        // Content
        totalSongs:           user.totalSongs    || 0,
        totalUploads:         user.totalUploads  || 0,

        // Performance
        performanceScore,
        scoreBreakdown: {
          consistency:  Math.round(consistencyScore),
          growth:       Math.round(growthScore),
          engagement:   68,   // Placeholder
          productivity: Math.round(productivityScore),
        },
      },
    })
  }),
)

// ─── GET /analytics/heatmap ──────────────────────────────────────────────────

router.get('/heatmap',
  authenticate,
  [
    qv('year')
      .optional()
      .isInt({ min: 2020, max: 2030 })
      .withMessage('Invalid year'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid  = req.user!.uid
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear()

    const result = await query(
      `SELECT
         date::text AS date,
         LEAST(FLOOR(practice_minutes / 30), 4)::int AS count
       FROM daily_analytics
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM date) = $2
       ORDER BY date ASC`,
      [uid, year],
    )

    // Fill in zero days for the full year
    const dataMap = new Map<string, number>()
    result.rows.forEach(row => {
      dataMap.set(row.date, row.count)
    })

    const heatmap: { date: string; count: number }[] = []
    const start = new Date(`${year}-01-01`)
    const end   = new Date(`${year}-12-31`)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      heatmap.push({
        date:  dateStr,
        count: dataMap.get(dateStr) || 0,
      })
    }

    sendSuccess(res, {
      heatmap,
      year,
      totalActiveDays: result.rows.filter(r => r.count > 0).length,
    })
  }),
)

// ─── GET /analytics/growth ───────────────────────────────────────────────────

router.get('/growth',
  authenticate,
  [
    qv('period')
      .optional()
      .isIn(['week', 'month', 'year'])
      .withMessage('Period must be week, month, or year'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid    = req.user!.uid
    const period = (req.query.period as string) || 'month'

    const intervalMap: Record<string, string> = {
      week:  '7 days',
      month: '30 days',
      year:  '365 days',
    }

    const groupByMap: Record<string, string> = {
      week:  'day',
      month: 'day',
      year:  'month',
    }

    const interval = intervalMap[period]
    const groupBy  = groupByMap[period]

    const result = await query(
      `SELECT
         DATE_TRUNC($1, date)::date::text AS period,
         SUM(practice_minutes) AS "practiceMinutes",
         COUNT(*) FILTER (WHERE practice_minutes > 0) AS "activeDays"
       FROM daily_analytics
       WHERE user_id = $2
         AND date >= NOW() - INTERVAL '${interval}'
       GROUP BY DATE_TRUNC($1, date)
       ORDER BY DATE_TRUNC($1, date) ASC`,
      [groupBy, uid],
    )

    sendSuccess(res, {
      growth: result.rows,
      period,
    })
  }),
)

// ─── GET /analytics/daily ────────────────────────────────────────────────────

router.get('/daily',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid

    const result = await query(
      `SELECT
         date::text AS date,
         practice_minutes AS "practiceMinutes",
         songs_practiced AS "songsPracticed",
         songs_recorded AS "songsRecorded",
         songs_posted AS "songsPosted"
       FROM daily_analytics
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 30`,
      [uid],
    )

    sendSuccess(res, { daily: result.rows })
  }),
)

// ─── GET /analytics/performance ──────────────────────────────────────────────

router.get('/performance',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid

    const [streakResult, consistencyResult, songsResult] = await Promise.all([
      query('SELECT current_streak, longest_streak FROM users WHERE uid = $1', [uid]),

      query(
        `SELECT COUNT(*) FILTER (WHERE practice_minutes > 0) AS "activeDays"
         FROM daily_analytics
         WHERE user_id = $1 AND date >= NOW() - INTERVAL '30 days'`,
        [uid],
      ),

      query(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE 'posted' = ANY(status)) AS posted
         FROM songs WHERE user_id = $1`,
        [uid],
      ),
    ])

    const streak      = streakResult.rows[0]      || {}
    const consistency = consistencyResult.rows[0] || {}
    const songs       = songsResult.rows[0]       || {}

    // Score components (0-100)
    const scores = {
      consistency:  Math.min(Math.round((parseInt(consistency.activeDays) || 0) / 30 * 100), 100),
      growth:       72,  // From social integrations
      engagement:   68,  // From social integrations
      productivity: Math.min(Math.round((parseInt(songs.total) || 0) / 50 * 100), 100),
    }

    const overall = Math.round(
      scores.consistency  * 0.35 +
      scores.growth       * 0.25 +
      scores.engagement   * 0.20 +
      scores.productivity * 0.20,
    )

    const label = overall >= 85 ? 'Excellent!'
      : overall >= 70 ? 'Good — keep going!'
      : overall >= 50 ? 'Fair — room to grow'
      : 'Needs attention'

    sendSuccess(res, {
      performance: {
        overall,
        label,
        breakdown: scores,
        currentStreak: streak.current_streak || 0,
        longestStreak: streak.longest_streak || 0,
      },
    })
  }),
)

// ─── GET /analytics/report ───────────────────────────────────────────────────

router.get('/report',
  authenticate,
  [
    qv('period')
      .optional()
      .isIn(['weekly', 'monthly', 'yearly'])
      .withMessage('Period must be weekly, monthly, or yearly'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid    = req.user!.uid
    const period = (req.query.period as string) || 'weekly'

    const intervalMap: Record<string, string> = {
      weekly:  '7 days',
      monthly: '30 days',
      yearly:  '365 days',
    }

    const interval = intervalMap[period]

    const [practiceResult, songsResult, topSongsResult] = await Promise.all([
      // Practice data
      query(
        `SELECT
           date::text AS date,
           practice_minutes AS "practiceMinutes"
         FROM daily_analytics
         WHERE user_id = $1
           AND date >= NOW() - INTERVAL '${interval}'
         ORDER BY date ASC`,
        [uid],
      ),

      // Songs stats
      query(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE 'practiced' = ANY(status)) AS practiced,
           COUNT(*) FILTER (WHERE 'recorded'  = ANY(status)) AS recorded,
           COUNT(*) FILTER (WHERE 'posted'    = ANY(status)) AS posted
         FROM songs
         WHERE user_id = $1
           AND updated_at >= NOW() - INTERVAL '${interval}'`,
        [uid],
      ),

      // Top practiced songs
      query(
        `SELECT title, artist, practice_count AS "practiceCount",
                total_practice_min AS "totalPracticeMin"
         FROM songs
         WHERE user_id = $1
         ORDER BY practice_count DESC
         LIMIT 5`,
        [uid],
      ),
    ])

    const totalPractice = practiceResult.rows.reduce(
      (sum, row) => sum + (parseInt(row.practiceMinutes) || 0), 0,
    )

    sendSuccess(res, {
      report: {
        period,
        startDate: new Date(Date.now() - ms(interval)).toISOString(),
        endDate:   new Date().toISOString(),
        practice: {
          daily:        practiceResult.rows,
          totalMinutes: totalPractice,
          totalHours:   Math.round(totalPractice / 60 * 10) / 10,
          avgPerDay:    Math.round(totalPractice / practiceResult.rows.length || 0),
        },
        songs: songsResult.rows[0] || {},
        topSongs: topSongsResult.rows,
      },
    })
  }),
)

// ─── MS HELPER ───────────────────────────────────────────────────────────────

function ms(interval: string): number {
  const map: Record<string, number> = {
    '7 days':   7   * 24 * 60 * 60 * 1000,
    '30 days':  30  * 24 * 60 * 60 * 1000,
    '365 days': 365 * 24 * 60 * 60 * 1000,
  }
  return map[interval] || 7 * 24 * 60 * 60 * 1000
}

export default router
