/* ============================================================
   SVARAVERSE AI — Community Routes
   Feed | Posts | Likes | Comments | Members | Discovery
   ============================================================ */

import { Router, type Request, type Response } from 'express'
import { body, param, query as qv } from 'express-validator'

import { authenticate, optionalAuth } from '../middleware/authMiddleware'
import { validate, asyncHandler,
         sendSuccess, sendCreated,
         sendNoContent, Errors }      from '../middleware/errorHandler'
import { query, withTransaction,
         buildPagination,
         buildPaginatedResult }       from '../config/db'
import { io }                         from '../server'
import { logger }                     from '../utils/logger'

const router = Router()

// ─── VALIDATORS ──────────────────────────────────────────────────────────────

const POST_TYPES = ['text', 'audio', 'video', 'image', 'collab']

const postValidators = [
  body('content')
    .trim().notEmpty().withMessage('Post content is required')
    .isLength({ max: 2000 }).withMessage('Content max 2000 characters'),
  body('type')
    .optional()
    .isIn(POST_TYPES).withMessage('Invalid post type'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('mediaUrl')
    .optional().trim()
    .isURL().withMessage('Invalid media URL')
    .optional({ checkFalsy: true }),
  body('songId')
    .optional().trim(),
]

const commentValidators = [
  body('content')
    .trim().notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 500 }).withMessage('Comment max 500 characters'),
]

// ─── GET /community/feed ─────────────────────────────────────────────────────

router.get('/feed',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const viewerUid = req.user?.uid
    const {
      page  = '1',
      limit = '15',
      type,
    } = req.query as Record<string, string>

    const { offset, limit: lim } = buildPagination({
      page:  parseInt(page),
      limit: parseInt(limit),
    })

    const conditions: string[] = ['p.is_deleted = false']
    const params: unknown[]    = []
    let   idx                  = 1

    if (type) {
      conditions.push(`p.type = $${idx}`)
      params.push(type); idx++
    }

    const where = `WHERE ${conditions.join(' AND ')}`

    // Count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM community_posts p ${where}`,
      params,
    )
    const total = parseInt(countResult.rows[0]?.count || '0', 10)

    // Feed query
    const result = await query(
      `SELECT
         p.id, p.user_id AS "userId", p.type,
         p.content, p.media_url AS "mediaUrl",
         p.song_id AS "songId", p.tags,
         p.likes_count AS "likesCount",
         p.comments_count AS "commentsCount",
         p.shares_count AS "sharesCount",
         p.created_at AS "createdAt",
         -- Author info
         u.display_name AS "authorName",
         u.username AS "authorUsername",
         u.photo_url AS "authorPhotoURL",
         u.role AS "authorRole",
         u.plan AS "authorPlan",
         -- Song info
         s.title AS "songTitle",
         s.artist AS "songArtist",
         -- Like status for viewer
         ${viewerUid ? `
         EXISTS(
           SELECT 1 FROM post_likes
           WHERE post_id = p.id AND user_id = '${viewerUid}'
         ) AS "isLiked"` : 'false AS "isLiked"'}
       FROM community_posts p
       JOIN users u ON u.uid = p.user_id
       LEFT JOIN songs s ON s.id = p.song_id::uuid
       ${where}
       ORDER BY p.created_at DESC
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

// ─── GET /community/posts — User's own posts ──────────────────────────────

router.get('/posts',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid   = req.user!.uid
    const page  = parseInt((req.query.page as string) || '1')
    const limit = parseInt((req.query.limit as string) || '10')

    const { offset, limit: lim } = buildPagination({ page, limit })

    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM community_posts WHERE user_id = $1 AND is_deleted = false',
      [uid],
    )
    const total = parseInt(countResult.rows[0]?.count || '0', 10)

    const result = await query(
      `SELECT
         id, type, content, media_url AS "mediaUrl",
         tags, likes_count AS "likesCount",
         comments_count AS "commentsCount",
         created_at AS "createdAt"
       FROM community_posts
       WHERE user_id = $1 AND is_deleted = false
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [uid, lim, offset],
    )

    res.json({
      success: true,
      ...buildPaginatedResult(result.rows, total, { page, limit: lim }),
    })
  }),
)

// ─── POST /community/posts ────────────────────────────────────────────────

router.post('/posts',
  authenticate,
  postValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid
    const {
      content, type = 'text', tags, mediaUrl, songId,
    } = req.body as {
      content: string; type?: string; tags?: string[]
      mediaUrl?: string; songId?: string
    }

    const result = await query(
      `INSERT INTO community_posts (
         user_id, type, content, media_url, song_id, tags,
         likes_count, comments_count, shares_count,
         is_deleted, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         0, 0, 0, false, NOW(), NOW()
       )
       RETURNING
         id, user_id AS "userId", type, content,
         media_url AS "mediaUrl", song_id AS "songId",
         tags, likes_count AS "likesCount",
         created_at AS "createdAt"`,
      [
        uid, type, content,
        mediaUrl || null,
        songId   || null,
        JSON.stringify(tags || []),
      ],
    )

    const post = result.rows[0]

    // Emit to community room via Socket.io
    io.to('community').emit('community:new_post', {
      ...post,
      authorName:     req.user!.displayName,
      authorUsername: req.user!.dbUser?.username,
    })

    logger.info(`Community post created: ${post.id} by ${uid}`)
    sendCreated(res, { post }, 'Post shared! 🎵')
  }),
)

// ─── GET /community/posts/:id ─────────────────────────────────────────────

router.get('/posts/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const viewerUid = req.user?.uid

    const result = await query(
      `SELECT
         p.id, p.user_id AS "userId", p.type,
         p.content, p.media_url AS "mediaUrl",
         p.song_id AS "songId", p.tags,
         p.likes_count AS "likesCount",
         p.comments_count AS "commentsCount",
         p.shares_count AS "sharesCount",
         p.created_at AS "createdAt",
         u.display_name AS "authorName",
         u.username AS "authorUsername",
         u.photo_url AS "authorPhotoURL",
         u.role AS "authorRole", u.plan AS "authorPlan",
         s.title AS "songTitle", s.artist AS "songArtist",
         ${viewerUid ? `
         EXISTS(
           SELECT 1 FROM post_likes
           WHERE post_id = p.id AND user_id = '${viewerUid}'
         ) AS "isLiked"` : 'false AS "isLiked"'}
       FROM community_posts p
       JOIN users u ON u.uid = p.user_id
       LEFT JOIN songs s ON s.id = p.song_id::uuid
       WHERE p.id = $1 AND p.is_deleted = false`,
      [req.params.id],
    )

    if (!result.rows[0]) throw Errors.NotFound('Post')

    // Fetch top comments
    const comments = await query(
      `SELECT
         c.id, c.content,
         c.likes_count AS "likesCount",
         c.created_at AS "createdAt",
         u.display_name AS "authorName",
         u.username AS "authorUsername",
         u.photo_url AS "authorPhotoURL"
       FROM post_comments c
       JOIN users u ON u.uid = c.user_id
       WHERE c.post_id = $1 AND c.is_deleted = false
       ORDER BY c.created_at DESC
       LIMIT 20`,
      [req.params.id],
    )

    sendSuccess(res, {
      post:     result.rows[0],
      comments: comments.rows,
    })
  }),
)

// ─── DELETE /community/posts/:id ──────────────────────────────────────────

router.delete('/posts/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `UPDATE community_posts
       SET is_deleted = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user!.uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Post')

    sendNoContent(res)
  }),
)

// ─── POST /community/posts/:id/like ──────────────────────────────────────

router.post('/posts/:id/like',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid    = req.user!.uid
    const postId = req.params.id

    // Check post exists
    const postCheck = await query(
      'SELECT id, user_id FROM community_posts WHERE id = $1 AND is_deleted = false',
      [postId],
    )
    if (!postCheck.rows[0]) throw Errors.NotFound('Post')

    let liked = false

    await withTransaction(async (client) => {
      // Try to insert like
      const insertResult = await client.query(
        `INSERT INTO post_likes (post_id, user_id, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [postId, uid],
      )

      if (insertResult.rows[0]) {
        // New like — increment count
        await client.query(
          'UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1',
          [postId],
        )
        liked = true
      } else {
        // Already liked — remove (toggle)
        await client.query(
          'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
          [postId, uid],
        )
        await client.query(
          'UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
          [postId],
        )
        liked = false
      }
    })

    // Get updated count
    const updated = await query(
      'SELECT likes_count AS "likesCount" FROM community_posts WHERE id = $1',
      [postId],
    )

    sendSuccess(res, {
      liked,
      likesCount: updated.rows[0]?.likesCount || 0,
    })
  }),
)

// ─── GET /community/posts/:id/comments ───────────────────────────────────

router.get('/posts/:id/comments',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const page  = parseInt((req.query.page as string) || '1')
    const limit = parseInt((req.query.limit as string) || '20')
    const { offset, limit: lim } = buildPagination({ page, limit })

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM post_comments
       WHERE post_id = $1 AND is_deleted = false`,
      [req.params.id],
    )
    const total = parseInt(countResult.rows[0]?.count || '0', 10)

    const result = await query(
      `SELECT
         c.id, c.content,
         c.likes_count AS "likesCount",
         c.created_at AS "createdAt",
         u.uid AS "userId",
         u.display_name AS "authorName",
         u.username AS "authorUsername",
         u.photo_url AS "authorPhotoURL",
         u.role AS "authorRole"
       FROM post_comments c
       JOIN users u ON u.uid = c.user_id
       WHERE c.post_id = $1 AND c.is_deleted = false
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [req.params.id, lim, offset],
    )

    res.json({
      success: true,
      ...buildPaginatedResult(result.rows, total, { page, limit: lim }),
    })
  }),
)

// ─── POST /community/posts/:id/comments ──────────────────────────────────

router.post('/posts/:id/comments',
  authenticate,
  commentValidators,
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid    = req.user!.uid
    const postId = req.params.id
    const { content } = req.body as { content: string }

    // Check post exists
    const postCheck = await query(
      'SELECT id FROM community_posts WHERE id = $1 AND is_deleted = false',
      [postId],
    )
    if (!postCheck.rows[0]) throw Errors.NotFound('Post')

    const result = await withTransaction(async (client) => {
      // Insert comment
      const commentResult = await client.query(
        `INSERT INTO post_comments (post_id, user_id, content, likes_count, is_deleted, created_at)
         VALUES ($1, $2, $3, 0, false, NOW())
         RETURNING id, content, likes_count AS "likesCount", created_at AS "createdAt"`,
        [postId, uid, content],
      )

      // Increment comment count on post
      await client.query(
        'UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = $1',
        [postId],
      )

      return commentResult.rows[0]
    })

    // Emit real-time comment
    io.to('community').emit('community:new_comment', {
      postId,
      comment: {
        ...result,
        authorName:     req.user!.displayName,
        authorUsername: req.user!.dbUser?.username,
      },
    })

    sendCreated(res, {
      comment: {
        ...result,
        authorName:     req.user!.displayName,
        authorUsername: req.user!.dbUser?.username,
        authorPhotoURL: req.user!.dbUser?.photoURL,
      },
    })
  }),
)

// ─── GET /community/members ───────────────────────────────────────────────

router.get('/members',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const viewerUid = req.user?.uid
    const {
      page      = '1',
      limit     = '12',
      search,
      genre,
      instrument,
      city,
    } = req.query as Record<string, string>

    const { offset, limit: lim } = buildPagination({
      page:  parseInt(page),
      limit: parseInt(limit),
    })

    const conditions: string[] = ['u.is_active = true']
    const params: unknown[]    = []
    let   idx                  = 1

    if (search) {
      conditions.push(
        `(LOWER(u.display_name) LIKE $${idx}
          OR LOWER(u.username) LIKE $${idx}
          OR LOWER(u.bio) LIKE $${idx})`,
      )
      params.push(`%${search.toLowerCase()}%`); idx++
    }

    if (city) {
      conditions.push(`LOWER(u.city) LIKE $${idx}`)
      params.push(`%${city.toLowerCase()}%`); idx++
    }

    if (genre) {
      conditions.push(`$${idx} = ANY(u.genres)`)
      params.push(genre); idx++
    }

    if (instrument) {
      conditions.push(`$${idx} = ANY(u.instruments)`)
      params.push(instrument); idx++
    }

    const where = `WHERE ${conditions.join(' AND ')}`

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM users u ${where}`,
      params,
    )
    const total = parseInt(countResult.rows[0]?.count || '0', 10)

    const result = await query(
      `SELECT
         u.uid AS id,
         u.display_name AS "displayName",
         u.username, u.photo_url AS "photoURL",
         u.bio, u.city, u.role, u.plan,
         u.genres, u.instruments,
         u.total_songs AS "totalSongs",
         u.current_streak AS "currentStreak",
         (SELECT COUNT(*) FROM follows WHERE following_id = u.uid) AS "followers",
         ${viewerUid ? `
         EXISTS(
           SELECT 1 FROM follows
           WHERE follower_id = '${viewerUid}' AND following_id = u.uid
         ) AS "isFollowing"` : 'false AS "isFollowing"'}
       FROM users u
       ${where}
       ORDER BY u.total_songs DESC, u.current_streak DESC
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

// ─── GET /community/trending ──────────────────────────────────────────────

router.get('/trending',
  asyncHandler(async (_req: Request, res: Response) => {
    // Trending posts (last 24h, sorted by likes + comments)
    const posts = await query(
      `SELECT
         p.id, p.type, p.content, p.tags,
         p.likes_count AS "likesCount",
         p.comments_count AS "commentsCount",
         p.created_at AS "createdAt",
         u.display_name AS "authorName",
         u.username AS "authorUsername",
         u.photo_url AS "authorPhotoURL",
         (p.likes_count * 2 + p.comments_count) AS score
       FROM community_posts p
       JOIN users u ON u.uid = p.user_id
       WHERE p.is_deleted = false
         AND p.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY score DESC
       LIMIT 10`,
    )

    // Trending tags
    const tags = await query(
      `SELECT
         tag, COUNT(*) AS count
       FROM community_posts, UNNEST(tags) AS tag
       WHERE is_deleted = false
         AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY tag
       ORDER BY count DESC
       LIMIT 10`,
    )

    sendSuccess(res, {
      posts:       posts.rows,
      trendingTags:tags.rows,
    })
  }),
)

export default router
