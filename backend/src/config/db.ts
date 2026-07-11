/* ============================================================
   SVARAVERSE AI — PostgreSQL Database Configuration
   Connection Pool | Query Helper | Health Check | Migrations
   ============================================================ */

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'
import { logger } from '@/utils/logger'

// ─── CONNECTION POOL ─────────────────────────────────────────────────────────

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Pool sizing
  min:             2,
  max:             20,
  idleTimeoutMillis:    30_000,   // Close idle connections after 30s
  connectionTimeoutMillis: 5_000, // Fail if can't connect in 5s
  allowExitOnIdle: true,

  // SSL for production (Supabase requires it)
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
})

// ─── POOL EVENT LISTENERS ────────────────────────────────────────────────────

pool.on('connect', (client: PoolClient) => {
  logger.debug('New DB client connected')
  // Set search path for each connection
  client.query("SET search_path TO public")
})

pool.on('error', (err: Error) => {
  logger.error('Unexpected DB pool error:', err)
})

pool.on('remove', () => {
  logger.debug('DB client removed from pool')
})

// ─── CONNECT & VERIFY ────────────────────────────────────────────────────────

export async function connectDB(): Promise<void> {
  let client: PoolClient | null = null
  try {
    client = await pool.connect()
    const result = await client.query('SELECT NOW() as time, version() as version')
    const { time, version } = result.rows[0]
    logger.info(`Database connected ✅`)
    logger.info(`Time: ${time}`)
    logger.info(`Version: ${version.split(' ').slice(0, 2).join(' ')}`)
  } catch (err) {
    logger.error('Failed to connect to database:', err)
    throw err
  } finally {
    client?.release()
  }
}

// ─── QUERY HELPER ────────────────────────────────────────────────────────────

/**
 * Execute a parameterized SQL query
 * Automatically handles client acquisition and release
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text:   string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const start = Date.now()

  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start

    if (duration > 1000) {
      logger.warn(`Slow query detected (${duration}ms): ${text.slice(0, 100)}`)
    } else {
      logger.debug(`Query (${duration}ms): ${text.slice(0, 80)}`)
    }

    return result
  } catch (err) {
    logger.error('Query error:', { text: text.slice(0, 200), params, err })
    throw err
  }
}

/**
 * Get a dedicated client for transactions
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect()
}

/**
 * Execute multiple queries in a transaction
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    logger.error('Transaction rolled back:', err)
    throw err
  } finally {
    client.release()
  }
}

// ─── PAGINATION HELPER ───────────────────────────────────────────────────────

export interface PaginationParams {
  page:  number
  limit: number
}

export interface PaginatedResult<T> {
  data:       T[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
  hasNext:    boolean
  hasPrev:    boolean
}

export function buildPagination(params: PaginationParams): {
  offset: number
  limit:  number
} {
  const page   = Math.max(1, params.page)
  const limit  = Math.min(100, Math.max(1, params.limit))
  const offset = (page - 1) * limit
  return { offset, limit }
}

export function buildPaginatedResult<T>(
  data:   T[],
  total:  number,
  params: PaginationParams,
): PaginatedResult<T> {
  const page       = Math.max(1, params.page)
  const limit      = Math.min(100, Math.max(1, params.limit))
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// ─── COMMON QUERY BUILDERS ───────────────────────────────────────────────────

/**
 * Build a safe ORDER BY clause from user input
 */
export function buildOrderBy(
  sortBy:    string,
  sortOrder: 'asc' | 'desc',
  allowed:   string[],
  defaultCol:string = 'created_at',
): string {
  const col   = allowed.includes(sortBy) ? sortBy : defaultCol
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC'
  return `ORDER BY ${col} ${order}`
}

/**
 * Build a WHERE clause from optional filters
 * Returns { clause, params } where params are positional ($1, $2, ...)
 */
export function buildWhereClause(
  filters: Record<string, unknown>,
  startIdx: number = 1,
): { clause: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[]    = []
  let idx = startIdx

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue

    if (Array.isArray(value)) {
      if (value.length === 0) continue
      conditions.push(`${key} = ANY($${idx})`)
      params.push(value)
    } else {
      conditions.push(`${key} = $${idx}`)
      params.push(value)
    }
    idx++
  }

  const clause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  return { clause, params }
}

/**
 * Build a full-text search condition
 */
export function buildSearchClause(
  search:    string | undefined,
  columns:   string[],
  paramIdx:  number,
): { clause: string; param: string | null } {
  if (!search?.trim()) return { clause: '', param: null }

  const searchTerm = `%${search.trim().toLowerCase()}%`
  const conditions = columns.map(col => `LOWER(${col}) LIKE $${paramIdx}`)
  return {
    clause: `(${conditions.join(' OR ')})`,
    param:  searchTerm,
  }
}

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────

export async function checkDBHealth(): Promise<{
  status:      'ok' | 'error'
  latencyMs:   number
  poolSize:    number
  idleCount:   number
  waitingCount:number
}> {
  const start = Date.now()
  try {
    await pool.query('SELECT 1')
    return {
      status:       'ok',
      latencyMs:    Date.now() - start,
      poolSize:     pool.totalCount,
      idleCount:    pool.idleCount,
      waitingCount: pool.waitingCount,
    }
  } catch {
    return {
      status:       'error',
      latencyMs:    Date.now() - start,
      poolSize:     pool.totalCount,
      idleCount:    pool.idleCount,
      waitingCount: pool.waitingCount,
    }
  }
}

export default pool
