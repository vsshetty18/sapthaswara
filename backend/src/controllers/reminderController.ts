import { Request, Response, NextFunction } from 'express';
import ReminderModel from '../models/Reminder';
import { reminderSchema, validateRequest } from '../utils/validators';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

export const getReminders = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const reminders = await ReminderModel.findActiveByUser(req.user!.userId);
    return res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    next(error);
  }
};

export const createReminder = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(reminderSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const { type, title, scheduledTime, isRecurring, recurrencePattern } = validation.data;

    const reminder = await ReminderModel.create({
      userId: req.user!.userId,
      type,
      title,
      scheduledTime,
      isRecurring,
      recurrencePattern,
    });

    return res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
};

export const updateReminder = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await ReminderModel.findByUserAndId(req.user!.userId, req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const fieldMap: Record<string, string> = {
      title: 'title',
      description: 'description',
      scheduledTime: 'scheduled_time',
      isRecurring: 'is_recurring',
      recurrencePattern: 'recurrence_pattern',
      isActive: 'is_active',
    };

    const updates: Record<string, any> = {};
    for (const [camelKey, dbKey] of Object.entries(fieldMap)) {
      if (req.body[camelKey] !== undefined) {
        updates[dbKey] = req.body[camelKey];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const updated = await ReminderModel.update(req.params.id, updates);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteReminder = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const deleted = await ReminderModel.delete(req.params.id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    return res.status(200).json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    next(error);
  }
};
