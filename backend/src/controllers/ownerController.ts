import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User';
import AnalyticsModel from '../models/Analytics';
import SongModel from '../models/Song';
import { pool } from '../config/db';
import { paginate, buildPaginationMeta } from '../utils/helpers';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      dailyActiveUsers,
      monthlyActiveUsers,
      premiumUsers,
      totalRevenue,
      revenueThisMonth,
    ] = await Promise.all([
      UserModel.countTotal(),
      UserModel.countActiveToday(),
      UserModel.countActiveThisMonth(),
      UserModel.countByRole('premium'),
      AnalyticsModel.getTotalRevenue(),
      AnalyticsModel.getRevenueByPeriod('month'),
    ]);

    const platformCounts = await pool.query(
      `SELECT platform, COUNT(*) FROM app_sessions WHERE session_start >= NOW() - INTERVAL '30 days' GROUP BY platform`
    );

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        dailyActiveUsers,
        monthlyActiveUsers,
        premiumUsers,
        totalRevenue,
        revenueThisMonth,
        platformBreakdown: platformCounts.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = paginate(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const { users, total } = await UserModel.findMany({
      role: req.query.role as string | undefined,
      page,
      limit,
      offset,
    });

    const safeUsers = users.map(({ password_hash, ...u }) => u);

    return res.status(200).json({
      success: true,
      data: { items: safeUsers, meta: buildPaginationMeta(total, page, limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';

    const [revenueForPeriod, totalRevenue, subscriptionBreakdown] = await Promise.all([
      AnalyticsModel.getRevenueByPeriod(period),
      AnalyticsModel.getTotalRevenue(),
      pool.query(
        `SELECT plan, COUNT(*) as count FROM subscriptions WHERE status = 'active' GROUP BY plan`
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        period,
        revenueForPeriod,
        totalRevenue,
        subscriptionBreakdown: subscriptionBreakdown.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSupportTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = paginate(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );
    const status = req.query.status as string | undefined;

    const conditions = status ? 'WHERE status = $1' : '';
    const values = status ? [status] : [];

    const countResult = await pool.query(`SELECT COUNT(*) FROM support_tickets ${conditions}`, values);
    const ticketsResult = await pool.query(
      `SELECT st.*, u.username, u.email FROM support_tickets st
       JOIN users u ON u.id = st.user_id
       ${conditions}
       ORDER BY st.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        items: ticketsResult.rows,
        meta: buildPaginationMeta(parseInt(countResult.rows[0].count, 10), page, limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBugReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = paginate(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM bug_reports');
    const result = await pool.query(
      `SELECT * FROM bug_reports ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        items: result.rows,
        meta: buildPaginationMeta(parseInt(countResult.rows[0].count, 10), page, limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCrashReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = paginate(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM crash_reports');
    const result = await pool.query(
      `SELECT * FROM crash_reports ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        items: result.rows,
        meta: buildPaginationMeta(parseInt(countResult.rows[0].count, 10), page, limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, u.username FROM app_reviews ar
       LEFT JOIN users u ON u.id = ar.user_id
       ORDER BY ar.created_at DESC LIMIT 100`
    );

    const avgRatingResult = await pool.query('SELECT AVG(rating) as avg_rating FROM app_reviews');

    return res.status(200).json({
      success: true,
      data: {
        reviews: result.rows,
        averageRating: parseFloat(avgRatingResult.rows[0].avg_rating || '0').toFixed(2),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [aiUsageToday, aiUsageMonth, apiUsageStats, mostPopularSongs] = await Promise.all([
      AnalyticsModel.getAIUsageCost('day'),
      AnalyticsModel.getAIUsageCost('month'),
      AnalyticsModel.getApiUsageStats(),
      SongModel.getMostPopular(10),
    ]);

    const dbStatusResult = await pool.query('SELECT NOW() as db_time, version() as db_version');

    return res.status(200).json({
      success: true,
      data: {
        databaseStatus: 'connected',
        databaseTime: dbStatusResult.rows[0].db_time,
        aiUsageCostToday: aiUsageToday,
        aiUsageCostThisMonth: aiUsageMonth,
        apiUsageByService: apiUsageStats,
        mostPopularSongs,
        serverStatus: 'healthy',
        serverUptime: process.uptime(),
      },
    });
  } catch (error) {
    next(error);
  }
};
