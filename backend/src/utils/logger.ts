/* ============================================================
   SVARAVERSE AI — Logger
   Winston | Daily Rotation | Colored Console | Request ID
   ============================================================ */

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

// ─── LOG LEVELS ──────────────────────────────────────────────────────────────

const LOG_LEVELS = {
  error: 0,
  warn:  1,
  info:  2,
  http:  3,
  debug: 4,
}

const LOG_COLORS = {
  error: 'red',
  warn:  'yellow',
  info:  'green',
  http:  'magenta',
  debug: 'cyan',
}

winston.addColors(LOG_COLORS)

// ─── FORMATS ─────────────────────────────────────────────────────────────────

const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
})

// Console format — colorized + readable
const consoleFormat = winston.format.combine(
  timestampFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const rid    = requestId ? ` [${requestId}]` : ''
    const metaStr= Object.keys(meta).length
      ? `\n  ${JSON.stringify(meta, null, 2).split('\n').join('\n  ')}`
      : ''
    return `${timestamp} ${level}${rid}: ${message}${metaStr}`
  }),
)

// File format — JSON for structured log parsing
const fileFormat = winston.format.combine(
  timestampFormat,
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// ─── TRANSPORTS ──────────────────────────────────────────────────────────────

const logsDir = path.join(process.cwd(), 'logs')

const transports: winston.transport[] = []

// Console transport (always)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
  }),
)

// File transports (production / when LOG_TO_FILE=true)
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {

  // Combined log (all levels)
  transports.push(
    new DailyRotateFile({
      dirname:        logsDir,
      filename:       'svaraverse-%DATE%.log',
      datePattern:    'YYYY-MM-DD',
      zippedArchive:  true,
      maxSize:        '20m',
      maxFiles:       '30d',
      format:         fileFormat,
      level:          'debug',
    }),
  )

  // Error-only log
  transports.push(
    new DailyRotateFile({
      dirname:        logsDir,
      filename:       'svaraverse-error-%DATE%.log',
      datePattern:    'YYYY-MM-DD',
      zippedArchive:  true,
      maxSize:        '10m',
      maxFiles:       '90d',
      format:         fileFormat,
      level:          'error',
    }),
  )

  // HTTP access log
  transports.push(
    new DailyRotateFile({
      dirname:        logsDir,
      filename:       'svaraverse-http-%DATE%.log',
      datePattern:    'YYYY-MM-DD',
      zippedArchive:  true,
      maxSize:        '50m',
      maxFiles:       '14d',
      format:         fileFormat,
      level:          'http',
    }),
  )
}

// ─── LOGGER INSTANCE ─────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  levels:            LOG_LEVELS,
  level:             process.env.LOG_LEVEL || (
    process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  ),
  transports,
  exceptionHandlers: [
    new winston.transports.Console({ format: consoleFormat }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ format: consoleFormat }),
  ],
  exitOnError: false,
})

// ─── REQUEST-SCOPED LOGGER ───────────────────────────────────────────────────

/**
 * Create a child logger with request ID attached to every log line
 * Use inside Express route handlers:
 *   const log = requestLogger(req)
 *   log.info('Processing song upload')
 */
export function requestLogger(requestId: string) {
  return logger.child({ requestId })
}

// ─── CONVENIENCE WRAPPERS ────────────────────────────────────────────────────

export const log = {
  error:  (msg: string, meta?: unknown) => logger.error(msg, meta  ? { meta } : {}),
  warn:   (msg: string, meta?: unknown) => logger.warn(msg,  meta  ? { meta } : {}),
  info:   (msg: string, meta?: unknown) => logger.info(msg,  meta  ? { meta } : {}),
  http:   (msg: string, meta?: unknown) => logger.http(msg,  meta  ? { meta } : {}),
  debug:  (msg: string, meta?: unknown) => logger.debug(msg, meta  ? { meta } : {}),
}

// ─── PERFORMANCE TIMER ───────────────────────────────────────────────────────

/**
 * Measure execution time of an async operation
 * Usage:
 *   const end = perfTimer('AI request')
 *   await callOpenAI()
 *   end()  // logs: "AI request completed in 1234ms"
 */
export function perfTimer(label: string): () => void {
  const start = Date.now()
  return () => {
    const ms = Date.now() - start
    if (ms > 2000) {
      logger.warn(`⚠️  ${label} took ${ms}ms`)
    } else {
      logger.debug(`⏱  ${label} completed in ${ms}ms`)
    }
  }
}

// ─── AI USAGE LOGGER ─────────────────────────────────────────────────────────

interface AIUsageLog {
  userId:     string
  model:      string
  promptTokens:     number
  completionTokens: number
  totalTokens:      number
  costUSD:          number
  latencyMs:        number
  endpoint:         string
}

/**
 * Log OpenAI API usage for cost tracking
 */
export function logAIUsage(usage: AIUsageLog): void {
  logger.info('AI_USAGE', {
    type:    'ai_usage',
    ...usage,
  })
}

// ─── ERROR FORMATTER ─────────────────────────────────────────────────────────

/**
 * Format an error for structured logging
 */
export function formatError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name:    err.name,
      message: err.message,
      stack:   process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    }
  }
  return { raw: String(err) }
}

export default logger
