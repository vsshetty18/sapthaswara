import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

const jsonRateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
  });
};

/**
 * Standard limiter for general authenticated API routes.
 */
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
  keyGenerator: (req: AuthedRequest) => req.user?.userId || req.ip || 'anonymous',
});

/**
 * Stricter limiter for auth routes (login, signup, forgot-password) to prevent brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
  message: 'Too many authentication attempts, please try again later.',
});

/**
 * AI Coach routes are expensive (OpenAI cost) — tiered by subscription plan.
 * Free/basic users get a tighter limit; premium+ get a higher ceiling.
 */
export const aiCoachLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req: AuthedRequest) => {
    const role = req.user?.role;
    if (role === 'premium' || role === 'admin' || role === 'owner') return 100;
    if (role === 'creator') return 30;
    return 10; // free 'user' role
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
  keyGenerator: (req: AuthedRequest) => req.user?.userId || req.ip || 'anonymous',
  message: 'AI Coach request limit reached for your plan. Upgrade to Premium for higher limits.',
});

/**
 * File upload limiter (songs, posters, avatars) to prevent storage abuse.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
  keyGenerator: (req: AuthedRequest) => req.user?.userId || req.ip || 'anonymous',
});

/**
 * Very strict limiter for payment-related endpoints.
 */
export const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});
