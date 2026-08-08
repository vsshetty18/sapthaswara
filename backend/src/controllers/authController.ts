import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import admin from 'firebase-admin';
import UserModel from '../models/User';
import { pool } from '../config/db';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, validateRequest } from '../utils/validators';
import { isValidUsername, generateRandomString } from '../utils/helpers';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

const sanitizeUser = (user: any) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(signupSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }
    const { fullName, email, username, password } = validation.data;

    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      fullName,
      email,
      username,
      passwordHash,
      authProvider: 'email',
      isEmailVerified: false,
    });

    const verificationToken = generateRandomString(32);
    await pool.query(
      `INSERT INTO auth_tokens (user_id, token, token_type, expires_at)
       VALUES ($1, $2, 'email_verification', NOW() + INTERVAL '24 hours')`,
      [user.id, verificationToken]
    );

    // TODO: send verification email via nodemailer service

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    return res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user), accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(loginSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }
    const { identifier, password } = validation.data;

    const user = await UserModel.findByEmailOrUsername(identifier);
    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await UserModel.updateLastLogin(user.id);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    return res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user), accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    let user = await UserModel.findByFirebaseUid(decoded.uid);

    if (!user) {
      user = await UserModel.findByEmail(decoded.email || '');
    }

    if (!user) {
      let baseUsername = (decoded.email || 'user').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      if (!isValidUsername(baseUsername)) baseUsername = `user_${generateRandomString(6)}`;

      let username = baseUsername;
      let suffix = 0;
      while (await UserModel.findByUsername(username)) {
        suffix++;
        username = `${baseUsername}${suffix}`;
      }

      user = await UserModel.create({
        fullName: decoded.name || 'SvaraVerse User',
        email: decoded.email || '',
        username,
        firebaseUid: decoded.uid,
        authProvider: 'google',
        isEmailVerified: decoded.email_verified || false,
      });
    } else if (!user.firebase_uid) {
      user = await UserModel.updateById(user.id, { firebase_uid: decoded.uid });
    }

    await UserModel.updateLastLogin(user!.id);

    const { accessToken, refreshToken } = generateTokens(user!.id, user!.role);

    return res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user), accessToken, refreshToken },
    });
  } catch (error: any) {
    logger.error('Google login error', { error: error.message });
    return res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(forgotPasswordSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }
    const { email } = validation.data;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = generateRandomString(32);
    await pool.query(
      `INSERT INTO auth_tokens (user_id, token, token_type, expires_at)
       VALUES ($1, $2, 'password_reset', NOW() + INTERVAL '1 hour')`,
      [user.id, resetToken]
    );

    // TODO: send password reset email via nodemailer service

    return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(resetPasswordSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }
    const { token, newPassword } = validation.data;

    const tokenResult = await pool.query(
      `SELECT * FROM auth_tokens WHERE token = $1 AND token_type = 'password_reset' AND used = FALSE AND expires_at > NOW()`,
      [token]
    );
    const tokenRecord = tokenResult.rows[0];
    if (!tokenRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(tokenRecord.user_id, passwordHash);
    await pool.query('UPDATE auth_tokens SET used = TRUE WHERE id = $1', [tokenRecord.id]);

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const tokenResult = await pool.query(
      `SELECT * FROM auth_tokens WHERE token = $1 AND token_type = 'email_verification' AND used = FALSE AND expires_at > NOW()`,
      [token]
    );
    const tokenRecord = tokenResult.rows[0];
    if (!tokenRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    await UserModel.verifyEmail(tokenRecord.user_id);
    await pool.query('UPDATE auth_tokens SET used = TRUE WHERE id = $1', [tokenRecord.id]);

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user.id, user.role);
    return res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Stateless JWT — client discards tokens. Optionally blacklist here if needed.
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
