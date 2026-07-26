/* ============================================================
   SVARAVERSE AI — Payment Routes
   Razorpay | Orders | Verify | Subscription | History
   ============================================================ */

import { Router, type Request, type Response } from 'express'
import { body } from 'express-validator'
import Razorpay from 'razorpay'
import crypto   from 'crypto'

import { authenticate }          from '../middleware/authMiddleware'
import { validate, asyncHandler,
         sendSuccess, sendCreated,
         Errors }                from '../middleware/errorHandler'
import { query, withTransaction } from '../config/db'
import { setCustomClaims }        from '../config/firebase'
import { logger }                 from '../utils/logger'

const router = Router()

// ─── RAZORPAY CLIENT ─────────────────────────────────────────────────────────

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// ─── PLAN PRICING (paise) ────────────────────────────────────────────────────

const PLAN_PRICES: Record<string, { monthly: number; yearly: number; name: string }> = {
  basic:   { monthly: 29900,  yearly: 249900,  name: 'Creator'  },
  pro:     { monthly: 59900,  yearly: 499900,  name: 'Pro'      },
  premium: { monthly: 99900,  yearly: 799900,  name: 'Premium'  },
}

// ─── POST /payments/create-order ─────────────────────────────────────────────

router.post('/create-order',
  authenticate,
  [
    body('plan')
      .isIn(['basic', 'pro', 'premium'])
      .withMessage('Invalid plan'),
    body('billing')
      .isIn(['monthly', 'yearly'])
      .withMessage('Billing must be monthly or yearly'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const { plan, billing } = req.body as {
      plan: string; billing: 'monthly' | 'yearly'
    }
    const uid = req.user!.uid

    const planInfo  = PLAN_PRICES[plan]
    if (!planInfo) throw Errors.BadRequest('Invalid plan selected')

    const amount = planInfo[billing]

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt:  `sv_${uid.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId:  uid,
        plan,
        billing,
      },
    })

    // Save order to DB
    await query(
      `INSERT INTO payment_orders (
         order_id, user_id, plan, billing_cycle,
         amount, currency, status, created_at
       ) VALUES ($1, $2, $3, $4, $5, 'INR', 'created', NOW())
       ON CONFLICT (order_id) DO NOTHING`,
      [order.id, uid, plan, billing, amount],
    )

    logger.info(`Payment order created: ${order.id} for ${uid} (${plan}/${billing})`)

    sendCreated(res, {
      orderId:   order.id,
      amount,
      currency: 'INR',
      plan,
      billing,
      planName:  planInfo.name,
      keyId:     process.env.RAZORPAY_KEY_ID,
    })
  }),
)

// ─── POST /payments/verify ───────────────────────────────────────────────────

router.post('/verify',
  authenticate,
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID required'),
    body('razorpay_signature').notEmpty().withMessage('Signature required'),
  ],
  validate,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body as {
      razorpay_order_id:  string
      razorpay_payment_id:string
      razorpay_signature: string
    }

    const uid = req.user!.uid

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      logger.warn(`Payment signature mismatch for order: ${razorpay_order_id}`)
      throw Errors.BadRequest('Invalid payment signature. Payment verification failed.')
    }

    // Fetch order from DB
    const orderResult = await query(
      'SELECT * FROM payment_orders WHERE order_id = $1 AND user_id = $2',
      [razorpay_order_id, uid],
    )

    if (!orderResult.rows[0]) throw Errors.NotFound('Payment order')

    const order = orderResult.rows[0]

    // Calculate subscription end date
    const endDate = new Date()
    if (order.billing_cycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    await withTransaction(async (client) => {
      // Update order status
      await client.query(
        `UPDATE payment_orders
         SET status = 'paid', payment_id = $1, updated_at = NOW()
         WHERE order_id = $2`,
        [razorpay_payment_id, razorpay_order_id],
      )

      // Upsert subscription
      await client.query(
        `INSERT INTO subscriptions (
           user_id, plan, status, billing_cycle,
           start_date, end_date, payment_id,
           auto_renew, created_at, updated_at
         ) VALUES ($1, $2, 'active', $3, NOW(), $4, $5, true, NOW(), NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET
           plan         = $2,
           status       = 'active',
           billing_cycle= $3,
           start_date   = NOW(),
           end_date     = $4,
           payment_id   = $5,
           auto_renew   = true,
           updated_at   = NOW()`,
        [uid, order.plan, order.billing_cycle, endDate, razorpay_payment_id],
      )

      // Update user plan
      await client.query(
        'UPDATE users SET plan = $1, updated_at = NOW() WHERE uid = $2',
        [order.plan, uid],
      )
    })

    // Update Firebase custom claims
    await setCustomClaims(uid, {
      role: req.user!.role,
      plan: order.plan,
    })

    logger.info(`Payment verified: ${razorpay_payment_id} — ${uid} upgraded to ${order.plan}`)

    sendSuccess(res, {
      plan:      order.plan,
      paymentId: razorpay_payment_id,
      endDate:   endDate.toISOString(),
      message:   `Welcome to ${order.plan} plan! 🎵`,
    }, 'Payment successful!')
  }),
)

// ─── GET /payments/subscription ──────────────────────────────────────────────

router.get('/subscription',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await query(
      `SELECT
         s.plan, s.status, s.billing_cycle AS "billingCycle",
         s.start_date AS "startDate",
         s.end_date AS "endDate",
         s.auto_renew AS "autoRenew",
         s.payment_id AS "paymentId",
         s.created_at AS "createdAt",
         u.plan AS "currentPlan"
       FROM subscriptions s
       JOIN users u ON u.uid = s.user_id
       WHERE s.user_id = $1`,
      [req.user!.uid],
    )

    if (!result.rows[0]) {
      sendSuccess(res, {
        subscription: null,
        currentPlan:  req.user!.plan,
      })
      return
    }

    const sub = result.rows[0]
    const now = new Date()
    const end = new Date(sub.endDate)

    sendSuccess(res, {
      subscription: {
        ...sub,
        daysRemaining: Math.max(0, Math.floor((end.getTime() - now.getTime()) / 86400000)),
        isExpired:     end < now,
      },
    })
  }),
)

// ─── POST /payments/cancel ───────────────────────────────────────────────────

router.post('/cancel',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user!.uid

    const result = await query(
      `UPDATE subscriptions
       SET auto_renew = false, updated_at = NOW()
       WHERE user_id = $1 AND status = 'active'
       RETURNING end_date AS "endDate"`,
      [uid],
    )

    if (!result.rows[0]) throw Errors.NotFound('Active subscription')

    logger.info(`Subscription auto-renew cancelled: ${uid}`)

    sendSuccess(res, {
      endDate:   result.rows[0].endDate,
      autoRenew: false,
      message:   'Auto-renewal disabled. Access continues until end of billing period.',
    })
  }),
)

// ─── GET /payments/history ───────────────────────────────────────────────────

router.get('/history',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const page  = parseInt((req.query.page as string) || '1')
    const limit = 10
    const offset = (page - 1) * limit

    const result = await query(
      `SELECT
         order_id AS "orderId",
         payment_id AS "paymentId",
         plan, billing_cycle AS "billingCycle",
         amount, currency, status,
         created_at AS "createdAt"
       FROM payment_orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.uid, limit, offset],
    )

    const countResult = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM payment_orders WHERE user_id = $1',
      [req.user!.uid],
    )
    const total = parseInt(countResult.rows[0]?.count || '0', 10)

    sendSuccess(res, {
      history:    result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  }),
)

export default router
