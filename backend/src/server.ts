/* ============================================================
   SVARAVERSE AI — Main Server
   Express | Middleware | Routes | Socket.io | Error Handling
   ============================================================ */

import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import cors          from 'cors'
import helmet        from 'helmet'
import morgan        from 'morgan'
import compression   from 'compression'
import rateLimit     from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'

import { connectDB }       from './config/db'
import { initFirebase }    from './config/firebase'
import { logger }          from './utils/logger'

// ── Route imports ──────────────────────────────────────────
import authRoutes         from './routes/authRoutes'
import userRoutes         from './routes/userRoutes'
import songRoutes         from './routes/songRoutes'
import analyticsRoutes    from './routes/analyticsRoutes'
import aiRoutes           from './routes/aiRoutes'
import plannerRoutes      from './routes/plannerRoutes'
import reminderRoutes     from './routes/reminderRoutes'
import communityRoutes    from './routes/communityRoutes'
import ownerRoutes        from './routes/ownerRoutes'
import paymentRoutes      from './routes/paymentRoutes'
import notificationRoutes from './routes/notificationRoutes'
import integrationRoutes  from './routes/integrationRoutes'

// ── Error handlers ─────────────────────────────────────────
import { errorHandler, notFoundHandler } from './middleware/errorHandler'

// ─── ENVIRONMENT ─────────────────────────────────────────────────────────────

const PORT     = parseInt(process.env.PORT    || '4000', 10)
const NODE_ENV = process.env.NODE_ENV          || 'development'
const API_VER  = '/api/v1'

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL      || 'http://localhost:3000',
  process.env.FRONTEND_URL_PROD || 'https://svaraverse.ai',
  'http://localhost:3000',
  'http://localhost:3001',
]

// ─── APP INIT ────────────────────────────────────────────────────────────────

const app        = express()
const httpServer = createServer(app)

// ─── SOCKET.IO ───────────────────────────────────────────────────────────────

export const io = new SocketServer(httpServer, {
  cors: {
    origin:      ALLOWED_ORIGINS,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)

  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`)
    logger.info(`User ${userId} joined personal room`)
  })

  socket.on('join:community', () => {
    socket.join('community')
  })

  socket.on('leave:user', (userId: string) => {
    socket.leave(`user:${userId}`)
  })

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`)
  })
})

// ─── SECURITY MIDDLEWARE ─────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc:     ["'self'", 'data:', 'https://firebasestorage.googleapis.com'],
      connectSrc: ["'self'", 'https://api.openai.com', 'https://firestore.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// ─── CORS ────────────────────────────────────────────────────────────────────

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy violation: ${origin}`))
    }
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
}))

// ─── BODY PARSING ────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(compression())

// ─── LOGGING ─────────────────────────────────────────────────────────────────

if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg: string) => logger.http(msg.trim()) },
  }))
}

// ─── RATE LIMITING ───────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             500,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, error: 'Too many requests. Please try again later.' },
})

const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, error: 'Too many auth attempts. Please wait 15 minutes.' },
})

const aiLimiter = rateLimit({
  windowMs:        60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { success: false, error: 'AI rate limit reached. Please wait a moment.' },
})

app.use(globalLimiter)

// ─── REQUEST ID ──────────────────────────────────────────────────────────────

app.use((req: Request, _res: Response, next: NextFunction) => {
  req.headers['x-request-id'] =
    req.headers['x-request-id'] || crypto.randomUUID()
  next()
})

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status:    'ok',
    service:   'SvaraVerse API',
    version:   process.env.npm_package_version || '1.0.0',
    env:        NODE_ENV,
    timestamp:  new Date().toISOString(),
    uptime:     Math.floor(process.uptime()),
  })
})

app.get(`${API_VER}/ping`, (_req: Request, res: Response) => {
  res.json({ pong: true, ts: Date.now() })
})

// ─── API ROUTES ───────────────────────────────────────────────────────────────

app.use(`${API_VER}/auth`,          authLimiter,  authRoutes)
app.use(`${API_VER}/users`,                       userRoutes)
app.use(`${API_VER}/songs`,                       songRoutes)
app.use(`${API_VER}/analytics`,                   analyticsRoutes)
app.use(`${API_VER}/ai`,            aiLimiter,    aiRoutes)
app.use(`${API_VER}/planner`,                     plannerRoutes)
app.use(`${API_VER}/reminders`,                   reminderRoutes)
app.use(`${API_VER}/community`,                   communityRoutes)
app.use(`${API_VER}/owner`,                       ownerRoutes)
app.use(`${API_VER}/payments`,                    paymentRoutes)
app.use(`${API_VER}/notifications`,               notificationRoutes)
app.use(`${API_VER}/integrations`,                integrationRoutes)

// ─── 404 + ERROR HANDLERS ────────────────────────────────────────────────────

app.use(notFoundHandler)
app.use(errorHandler)

// ─── BOOTSTRAP ───────────────────────────────────────────────────────────────

async function bootstrap() {
  try {
    initFirebase()
    logger.info('✅ Firebase Admin initialized')

    await connectDB()
    logger.info('✅ PostgreSQL connected')

    httpServer.listen(PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║          🎵  SvaraVerse AI API Server            ║
╠══════════════════════════════════════════════════╣
║  Port:  ${PORT}                                     ║
║  Env:   ${NODE_ENV.padEnd(41)}║
║  API:   http://localhost:${PORT}${API_VER}         ║
╚══════════════════════════════════════════════════╝
      `.trim())
    })
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }
}

// ─── GRACEFUL SHUTDOWN ───────────────────────────────────────────────────────

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully...`)

  httpServer.close(async () => {
    io.close(() => logger.info('Socket.io closed'))
    const { pool } = await import('./config/db')
    await pool.end()
    logger.info('Database pool closed')
    logger.info('Shutdown complete ✅')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection:', reason)
})

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught exception:', err)
  process.exit(1)
})

bootstrap()

export default app
