/* ============================================================
   SVARAVERSE AI — Error Handler Middleware
   AppError Class | Validation Errors | Stack Traces
   ============================================================ */

import {
  type Request, type Response, type NextFunction,
} from 'express'
import { validationResult } from 'express-validator'
import { logger, formatError } from '../utils/logger'

// ─── APP ERROR CLASS ─────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code:       string
  public readonly isOperational: boolean
  public readonly data?:     unknown

  constructor(
    message:         string,
    statusCode:      number = 500,
    code:            string = 'INTERNAL_ERROR',
    isOperational:   boolean = true,
    data?:           unknown,
  ) {
    super(message)
    this.name          = 'AppError'
    this.statusCode    = statusCode
    this.code          = code
    this.isOperational = isOperational
    this.data          = data

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      success:    false,
      error:      this.message,
      code:       this.code,
      statusCode: this.statusCode,
      ...(this.data ? { data: this.data } : {}),
    }
  }
}

// ─── PRE-DEFINED ERRORS ───────────────────────────────────────────────────────

export const Errors = {
  // 400
  BadRequest: (msg = 'Bad request', data?: unknown) =>
    new AppError(msg, 400, 'BAD_REQUEST', true, data),

  ValidationFailed: (errors: Record<string, string>) =>
    new AppError('Validation failed', 400, 'VALIDATION_ERROR', true, { errors }),

  // 401
  Unauthorized: (msg = 'Authentication required') =>
    new AppError(msg, 401, 'UNAUTHORIZED', true),

  InvalidToken: () =>
    new AppError('Invalid or expired token', 401, 'INVALID_TOKEN', true),

  // 402
  PaymentRequired: (plan: string) =>
    new AppError(
      `This feature requires the ${plan} plan`,
      402, 'PAYMENT_REQUIRED', true, { requiredPlan: plan },
    ),

  // 403
  Forbidden: (msg = 'Access denied') =>
    new AppError(msg, 403, 'FORBIDDEN', true),

  EmailNotVerified: () =>
    new AppError(
      'Please verify your email to access this feature',
      403, 'EMAIL_NOT_VERIFIED', true,
    ),

  AccountDisabled: () =>
    new AppError(
      'Your account has been disabled. Contact support.',
      403, 'ACCOUNT_DISABLED', true,
    ),

  // 404
  NotFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND', true),

  // 409
  Conflict: (msg: string) =>
    new AppError(msg, 409, 'CONFLICT', true),

  DuplicateEntry: (field: string) =>
    new AppError(
      `A record with this ${field} already exists`,
      409, 'DUPLICATE_ENTRY', true, { field },
    ),

  // 429
  RateLimitExceeded: (msg = 'Too many requests') =>
    new AppError(msg, 429, 'RATE_LIMIT_EXCEEDED', true),

  AILimitExceeded: (used: number, limit: number, plan: string) =>
    new AppError(
      `Daily AI limit reached (${used}/${limit} on ${plan} plan)`,
      429, 'AI_LIMIT_EXCEEDED', true, { used, limit, plan },
    ),

  // 500
  Internal: (msg = 'An unexpected error occurred') =>
    new AppError(msg, 500, 'INTERNAL_ERROR', false),

  DatabaseError: () =>
    new AppError(
      'Database operation failed. Please try again.',
      500, 'DB_ERROR', false,
    ),

  ExternalServiceError: (service: string) =>
    new AppError(
      `${service} is temporarily unavailable`,
      503, 'EXTERNAL_SERVICE_ERROR', true, { service },
    ),
}

// ─── VALIDATION MIDDLEWARE ───────────────────────────────────────────────────

/**
 * Run express-validator checks and throw AppError if any fail.
 * Usage: router.post('/route', [...validators], validate, handler)
 */
export function validate(
  req:  Request,
  _res: Response,
  next: NextFunction,
): void {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    const errors: Record<string, string> = {}
    result.array().forEach(err => {
      if (err.type === 'field') {
        errors[err.path] = err.msg as string
      }
    })
    next(Errors.ValidationFailed(errors))
    return
  }

  next()
}

// ─── NOT FOUND HANDLER ───────────────────────────────────────────────────────

export function notFoundHandler(
  req:  Request,
  _res: Response,
  next: NextFunction,
): void {
  next(Errors.NotFound(`Route ${req.method} ${req.path}`))
}

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err:  Error | AppError,
  req:  Request,
  res:  Response,
  _next:NextFunction,
): void {
  const requestId = req.headers['x-request-id'] as string | undefined
  const isDev     = process.env.NODE_ENV !== 'production'

  // ── AppError (operational errors) ──────────────────────
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Operational error:', {
        ...formatError(err),
        requestId,
        path:   req.path,
        method: req.method,
        uid:    req.user?.uid,
      })
    } else {
      logger.warn(`Client error [${err.statusCode}]: ${err.message}`, {
        requestId,
        path:   req.path,
        method: req.method,
        code:   err.code,
      })
    }

    res.status(err.statusCode).json({
      success:    false,
      error:      err.message,
      code:       err.code,
      requestId,
      ...(err.data       ? { data: err.data }   : {}),
      ...(isDev && err.stack ? { stack: err.stack } : {}),
    })
    return
  }

  // ── PostgreSQL errors ───────────────────────────────────
  const pgErr = err as { code?: string; constraint?: string; detail?: string }

  if (pgErr.code === '23505') {
    // Unique violation
    const field = pgErr.constraint?.replace(/users_|_key/g, '') || 'field'
    logger.warn('DB unique violation:', { constraint: pgErr.constraint, requestId })
    res.status(409).json({
      success: false,
      error:   `A record with this ${field} already exists`,
      code:    'DUPLICATE_ENTRY',
      requestId,
    })
    return
  }

  if (pgErr.code === '23503') {
    // Foreign key violation
    logger.warn('DB foreign key violation:', { detail: pgErr.detail, requestId })
    res.status(400).json({
      success: false,
      error:   'Referenced record does not exist',
      code:    'FOREIGN_KEY_VIOLATION',
      requestId,
    })
    return
  }

  if (pgErr.code === '22P02') {
    // Invalid input syntax (e.g., bad UUID)
    res.status(400).json({
      success: false,
      error:   'Invalid ID format',
      code:    'INVALID_ID',
      requestId,
    })
    return
  }

  // ── JWT errors ──────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error:   'Invalid or expired token',
      code:    'INVALID_TOKEN',
      requestId,
    })
    return
  }

  // ── Multer errors (file upload) ─────────────────────────
  const multerErr = err as { code?: string; field?: string; storageErrors?: unknown[] }

  if (multerErr.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      error:   'File size exceeds the allowed limit',
      code:    'FILE_TOO_LARGE',
      requestId,
    })
    return
  }

  if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      success: false,
      error:   `Unexpected file field: ${multerErr.field}`,
      code:    'UNEXPECTED_FILE',
      requestId,
    })
    return
  }

  // ── Unknown / programming errors ────────────────────────
  logger.error('Unhandled error:', {
    ...formatError(err),
    requestId,
    path:   req.path,
    method: req.method,
    uid:    req.user?.uid,
  })

  res.status(500).json({
    success:   false,
    error:     isDev ? err.message : 'An unexpected error occurred. Please try again.',
    code:      'INTERNAL_ERROR',
    requestId,
    ...(isDev ? { stack: err.stack } : {}),
  })
}

// ─── ASYNC WRAPPER ───────────────────────────────────────────────────────────

/**
 * Wraps async route handlers to catch promise rejections
 * and forward them to the error handler automatically.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => {
 *     const data = await someAsyncOp()
 *     res.json({ success: true, data })
 *   }))
 */
export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: T, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }
}

// ─── SUCCESS RESPONSE HELPERS ────────────────────────────────────────────────

export function sendSuccess<T>(
  res:        Response,
  data:       T,
  message?:   string,
  statusCode: number = 200,
): void {
  res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  })
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201)
}

export function sendPaginated<T>(
  res:     Response,
  data:    T[],
  meta:    {
    total:      number
    page:       number
    limit:      number
    totalPages: number
    hasNext:    boolean
    hasPrev:    boolean
  },
): void {
  res.status(200).json({
    success: true,
    data,
    meta,
  })
}

export function sendNoContent(res: Response): void {
  res.status(204).send()
}
