import admin from 'firebase-admin';
import { config } from '../config/firebase';
import logger from '../utils/logger';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount as admin.ServiceAccount),
  });
}

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export type ReminderType =
  | 'practice'
  | 'live_session'
  | 'collaboration'
  | 'competition'
  | 'studio_booking'
  | 'recording'
  | 'birthday'
  | 'festival';

class NotificationService {
  async sendToDevice(fcmToken: string, payload: NotificationPayload): Promise<boolean> {
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'svaraverse_default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      });
      return true;
    } catch (error: any) {
      logger.error('FCM sendToDevice error', { error: error.message, fcmToken });
      return false;
    }
  }

  async sendToMultipleDevices(fcmTokens: string[], payload: NotificationPayload): Promise<{
    successCount: number;
    failureCount: number;
  }> {
    if (fcmTokens.length === 0) return { successCount: 0, failureCount: 0 };

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error: any) {
      logger.error('FCM sendToMultipleDevices error', { error: error.message });
      return { successCount: 0, failureCount: fcmTokens.length };
    }
  }

  async sendToTopic(topic: string, payload: NotificationPayload): Promise<boolean> {
    try {
      await admin.messaging().send({
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
      });
      return true;
    } catch (error: any) {
      logger.error('FCM sendToTopic error', { error: error.message, topic });
      return false;
    }
  }

  buildReminderPayload(type: ReminderType, title: string, scheduledTime: string): NotificationPayload {
    const templates: Record<ReminderType, string> = {
      practice: `🎵 Time to practice: ${title}`,
      live_session: `🔴 Your live session "${title}" starts soon!`,
      collaboration: `🤝 Collaboration reminder: ${title}`,
      competition: `🏆 Competition reminder: ${title}`,
      studio_booking: `🎙️ Studio booking reminder: ${title}`,
      recording: `⏺️ Recording session reminder: ${title}`,
      birthday: `🎂 ${title}`,
      festival: `🎉 ${title}`,
    };

    return {
      title: 'SvaraVerse Reminder',
      body: templates[type] || title,
      data: {
        type,
        scheduledTime,
      },
    };
  }

  async subscribeToTopic(fcmTokens: string[], topic: string): Promise<boolean> {
    try {
      await admin.messaging().subscribeToTopic(fcmTokens, topic);
      return true;
    } catch (error: any) {
      logger.error('FCM subscribeToTopic error', { error: error.message, topic });
      return false;
    }
  }

  async unsubscribeFromTopic(fcmTokens: string[], topic: string): Promise<boolean> {
    try {
      await admin.messaging().unsubscribeFromTopic(fcmTokens, topic);
      return true;
    } catch (error: any) {
      logger.error('FCM unsubscribeFromTopic error', { error: error.message, topic });
      return false;
    }
  }
}

export default new NotificationService();
