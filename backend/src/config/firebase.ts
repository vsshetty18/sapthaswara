/* ============================================================
   SVARAVERSE AI — Firebase Admin Configuration
   Auth Token Verification | Firestore | Push Notifications
   ============================================================ */

import * as admin from 'firebase-admin'
import { logger } from '../utils/logger'

// ─── INITIALIZE FIREBASE ADMIN ───────────────────────────────────────────────

let app: admin.app.App | null = null

export function initFirebase(): void {
  if (admin.apps.length > 0) {
    app = admin.apps[0] as admin.app.App
    return
  }

  try {
    // Option 1: Service account JSON from env (production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      ) as admin.ServiceAccount

      app = admin.initializeApp({
        credential:  admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    }

    // Option 2: Individual env vars
    else if (process.env.FIREBASE_PROJECT_ID) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    }

    // Option 3: Application default credentials (GCP environment)
    else {
      app = admin.initializeApp({
        credential:    admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
    }

    logger.info(`Firebase Admin initialized for project: ${app.options.projectId || 'default'}`)
  } catch (err) {
    logger.error('Firebase Admin initialization failed:', err)
    throw err
  }
}

// ─── SERVICE ACCESSORS ───────────────────────────────────────────────────────

export function getFirebaseAuth(): admin.auth.Auth {
  return admin.auth()
}

export function getFirestore(): admin.firestore.Firestore {
  return admin.firestore()
}

export function getFirebaseStorage(): admin.storage.Storage {
  return admin.storage()
}

export function getMessaging(): admin.messaging.Messaging {
  return admin.messaging()
}

// ─── AUTH TOKEN VERIFICATION ─────────────────────────────────────────────────

export interface DecodedToken {
  uid:           string
  email?:        string
  emailVerified: boolean
  name?:         string
  picture?:      string
  role?:         string
  plan?:         string
}

/**
 * Verify a Firebase ID token from Authorization header
 * Returns the decoded token payload
 */
export async function verifyIdToken(token: string): Promise<DecodedToken> {
  try {
    const decoded = await admin.auth().verifyIdToken(token, true)
    return {
      uid:           decoded.uid,
      email:         decoded.email,
      emailVerified: decoded.email_verified || false,
      name:          decoded.name,
      picture:       decoded.picture,
      role:          decoded['role']  as string | undefined,
      plan:          decoded['plan']  as string | undefined,
    }
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    logger.warn(`Token verification failed: ${error.code || error.message}`)
    throw new Error('Invalid or expired authentication token')
  }
}

/**
 * Get Firebase user by UID
 */
export async function getFirebaseUser(
  uid: string,
): Promise<admin.auth.UserRecord | null> {
  try {
    return await admin.auth().getUser(uid)
  } catch {
    return null
  }
}

/**
 * Set custom claims on a Firebase user (role, plan)
 */
export async function setCustomClaims(
  uid:    string,
  claims: Record<string, unknown>,
): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, claims)
  logger.info(`Custom claims set for user ${uid}:`, claims)
}

/**
 * Revoke refresh tokens for a user (force logout)
 */
export async function revokeUserTokens(uid: string): Promise<void> {
  await admin.auth().revokeRefreshTokens(uid)
  logger.info(`Tokens revoked for user ${uid}`)
}

/**
 * Delete a Firebase Auth user
 */
export async function deleteFirebaseUser(uid: string): Promise<void> {
  await admin.auth().deleteUser(uid)
  logger.info(`Firebase user deleted: ${uid}`)
}

/**
 * List Firebase users (for admin panel)
 */
export async function listFirebaseUsers(
  maxResults: number = 100,
  pageToken?: string,
): Promise<admin.auth.ListUsersResult> {
  return admin.auth().listUsers(maxResults, pageToken)
}

// ─── PUSH NOTIFICATIONS (FCM) ────────────────────────────────────────────────

export interface PushNotificationPayload {
  title:   string
  body:    string
  icon?:   string
  image?:  string
  data?:   Record<string, string>
  badge?:  string
  sound?:  string
}

/**
 * Send push notification to a single device
 */
export async function sendPushNotification(
  fcmToken: string,
  payload:  PushNotificationPayload,
): Promise<string | null> {
  try {
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: payload.title,
        body:  payload.body,
        ...(payload.image && { imageUrl: payload.image }),
      },
      data: payload.data || {},
      android: {
        priority:     'high',
        notification: {
          icon:  payload.icon  || 'ic_notification',
          color: '#B45309',
          sound: payload.sound || 'default',
          ...(payload.badge && { notificationCount: parseInt(payload.badge) }),
        },
      },
      apns: {
        payload: {
          aps: {
            badge:            parseInt(payload.badge || '0'),
            sound:            payload.sound || 'default',
            contentAvailable: true,
          },
        },
      },
      webpush: {
        notification: {
          title: payload.title,
          body:  payload.body,
          icon:  payload.icon,
          badge: '/icon-72x72.png',
        },
        fcmOptions: {
          link: process.env.FRONTEND_URL || 'https://svaraverse.ai',
        },
      },
    }

    const response = await admin.messaging().send(message)
    logger.debug(`Push notification sent: ${response}`)
    return response
  } catch (err) {
    logger.error('Push notification error:', err)
    return null
  }
}

/**
 * Send push notification to multiple devices
 */
export async function sendMulticastNotification(
  fcmTokens: string[],
  payload:   PushNotificationPayload,
): Promise<admin.messaging.BatchResponse | null> {
  if (fcmTokens.length === 0) return null

  try {
    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title: payload.title,
        body:  payload.body,
        ...(payload.image && { imageUrl: payload.image }),
      },
      data:    payload.data || {},
      android: {
        priority: 'high',
        notification: {
          icon:  payload.icon || 'ic_notification',
          color: '#B45309',
          sound: payload.sound || 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: parseInt(payload.badge || '0'),
            sound: payload.sound || 'default',
          },
        },
      },
    }

    const response = await admin.messaging().sendEachForMulticast(message)
    logger.info(
      `Multicast sent: ${response.successCount} success, ${response.failureCount} failed`,
    )
    return response
  } catch (err) {
    logger.error('Multicast notification error:', err)
    return null
  }
}

/**
 * Send notification to a topic (e.g., 'all-users', 'premium-users')
 */
export async function sendTopicNotification(
  topic:   string,
  payload: PushNotificationPayload,
): Promise<string | null> {
  try {
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title: payload.title,
        body:  payload.body,
      },
      data: payload.data || {},
    }

    const response = await admin.messaging().send(message)
    logger.info(`Topic notification sent to ${topic}: ${response}`)
    return response
  } catch (err) {
    logger.error('Topic notification error:', err)
    return null
  }
}

/**
 * Subscribe tokens to a topic
 */
export async function subscribeToTopic(
  fcmTokens: string[],
  topic:     string,
): Promise<void> {
  await admin.messaging().subscribeToTopic(fcmTokens, topic)
  logger.info(`${fcmTokens.length} tokens subscribed to topic: ${topic}`)
}

/**
 * Unsubscribe tokens from a topic
 */
export async function unsubscribeFromTopic(
  fcmTokens: string[],
  topic:     string,
): Promise<void> {
  await admin.messaging().unsubscribeFromTopic(fcmTokens, topic)
  logger.info(`${fcmTokens.length} tokens unsubscribed from topic: ${topic}`)
}

// ─── FIRESTORE HELPERS ───────────────────────────────────────────────────────

export const FIRESTORE_COLLECTIONS = {
  USERS:         'users',
  SONGS:         'songs',
  NOTIFICATIONS: 'notifications',
  AI_SESSIONS:   'ai_sessions',
  ANALYTICS:     'analytics',
} as const

/**
 * Send real-time notification via Firestore
 * (Firestore listeners on frontend pick this up instantly)
 */
export async function createFirestoreNotification(
  userId:  string,
  payload: {
    type:  string
    title: string
    body:  string
    data?: Record<string, unknown>
  },
): Promise<void> {
  const db = admin.firestore()

  await db
    .collection(FIRESTORE_COLLECTIONS.NOTIFICATIONS)
    .add({
      userId,
      ...payload,
      isRead:    false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })
}

/**
 * Update user document in Firestore from backend
 */
export async function updateFirestoreUser(
  uid:  string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = admin.firestore()
  await db
    .collection(FIRESTORE_COLLECTIONS.USERS)
    .doc(uid)
    .set(
      { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    )
}

export default admin
