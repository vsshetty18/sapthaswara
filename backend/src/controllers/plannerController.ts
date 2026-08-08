import { Request, Response, NextFunction } from 'express';
import ReminderModel from '../models/Reminder';
import { plannerTaskSchema, validateRequest } from '../utils/validators';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

export const getTasks = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const tasks = await ReminderModel.findPlannerTasksByDate(req.user!.userId, date);
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(plannerTaskSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const { title, category, scheduledDate, notes } = validation.data;
    const task = await ReminderModel.createPlannerTask({
      userId: req.user!.userId,
      title,
      category,
      notes,
      scheduledDate: scheduledDate ? scheduledDate.slice(0, 10) : undefined,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const fieldMap: Record<string, string> = {
      title: 'title',
      category: 'category',
      notes: 'notes',
      scheduledDate: 'scheduled_date',
    };

    const updates: Record<string, any> = {};
    for (const [camelKey, dbKey] of Object.entries(fieldMap)) {
      if (req.body[camelKey] !== undefined) {
        updates[dbKey] = req.body[camelKey];
      }
    }

    let task;
    if (req.body.isCompleted === true) {
      task = await ReminderModel.completePlannerTask(req.params.id, req.user!.userId);
    } else if (Object.keys(updates).length > 0) {
      task = await ReminderModel.updatePlannerTask(req.params.id, req.user!.userId, updates);
    }

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const deleted = await ReminderModel.deletePlannerTask(req.params.id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    return res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const progress = await ReminderModel.getPlannerProgress(req.user!.userId, date);
    return res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};
