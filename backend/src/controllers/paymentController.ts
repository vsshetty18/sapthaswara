import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { pool } from '../config/db';
import logger from '../utils/logger';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

const PLAN_PRICING: Record<string, { amount: number; label: string }> = {
  premium_monthly: { amount: 29900, label: 'Premium Monthly' }, // in paise (₹299)
  premium_yearly: { amount: 249900, label: 'Premium Yearly' }, // in paise (₹2499)
};

export const createOrder = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { plan } = req.body;
    const pricing = PLAN_PRICING[plan];

    if (!pricing) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan' });
    }

    const order = await razorpay.orders.create({
      amount: pricing.amount,
      currency: 'INR',
      receipt: `receipt_${req.user!.userId}_${Date.now()}`,
      notes: { userId: req.user!.userId, plan },
    });

    await pool.query(
      `INSERT INTO payments (user_id, razorpay_order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, 'created')`,
      [req.user!.userId, order.id, pricing.amount / 100, 'INR']
    );

    return res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    logger.error('Create order error', { error: error.message });
    next(error);
  }
};

export const verifyPayment = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    await pool.query(
      `UPDATE payments SET razorpay_payment_id = $1, status = 'captured'
       WHERE razorpay_order_id = $2 AND user_id = $3`,
      [razorpayPaymentId, razorpayOrderId, req.user!.userId]
    );

    const periodEnd =
      plan === 'premium_yearly'
        ? `NOW() + INTERVAL '1 year'`
        : `NOW() + INTERVAL '1 month'`;

    const subscriptionResult = await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end)
       VALUES ($1, $2, 'active', NOW(), ${periodEnd})
       ON CONFLICT (user_id) DO UPDATE SET
         plan = EXCLUDED.plan,
         status = 'active',
         current_period_start = NOW(),
         current_period_end = ${periodEnd}
       RETURNING *`,
      [req.user!.userId, plan]
    );

    await pool.query('UPDATE users SET role = $1 WHERE id = $2 AND role = $3', [
      'premium',
      req.user!.userId,
      'user',
    ]);

    return res.status(200).json({
      success: true,
      data: { subscription: subscriptionResult.rows[0] },
      message: 'Payment verified and subscription activated',
    });
  } catch (error: any) {
    logger.error('Verify payment error', { error: error.message });
    next(error);
  }
};

export const razorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.captured': {
        const paymentEntity = payload.payment.entity;
        await pool.query(
          `UPDATE payments SET status = 'captured' WHERE razorpay_order_id = $1`,
          [paymentEntity.order_id]
        );
        break;
      }
      case 'payment.failed': {
        const paymentEntity = payload.payment.entity;
        await pool.query(
          `UPDATE payments SET status = 'failed' WHERE razorpay_order_id = $1`,
          [paymentEntity.order_id]
        );
        break;
      }
      case 'subscription.cancelled': {
        const subEntity = payload.subscription.entity;
        await pool.query(
          `UPDATE subscriptions SET status = 'cancelled' WHERE razorpay_subscription_id = $1`,
          [subEntity.id]
        );
        break;
      }
      default:
        logger.info('Unhandled Razorpay webhook event', { event });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Razorpay webhook error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

export const getSubscription = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, data: { plan: 'free', status: 'active' } });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `UPDATE subscriptions SET cancel_at_period_end = TRUE
       WHERE user_id = $1 AND status = 'active'
       RETURNING *`,
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active subscription found' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Subscription will be cancelled at the end of the current billing period',
    });
  } catch (error) {
    next(error);
  }
};
