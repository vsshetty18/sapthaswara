import { z } from 'zod';

export const loginFormSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const signupFormSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const forgotPasswordFormSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export const songFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  movie: z.string().max(200).optional(),
  singer: z.string().max(200).optional(),
  composer: z.string().max(200).optional(),
  lyricist: z.string().max(200).optional(),
  scale: z.string().max(50).optional(),
  language: z.string().max(50).optional(),
  mood: z.string().max(50).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['practiced', 'recorded', 'posted', 'need_improvement', 'favourite']).optional(),
  lyrics: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type SongFormValues = z.infer<typeof songFormSchema>;

export const playlistFormSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100),
  description: z.string().max(500).optional(),
});

export type PlaylistFormValues = z.infer<typeof playlistFormSchema>;

export const plannerTaskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  category: z.enum([
    'practice',
    'recording',
    'editing',
    'posting',
    'reply_comments',
    'networking',
    'learning',
    'listening',
    'writing',
  ]),
  notes: z.string().max(1000).optional(),
});

export type PlannerTaskFormValues = z.infer<typeof plannerTaskFormSchema>;

export const reminderFormSchema = z.object({
  type: z.enum([
    'practice',
    'live_session',
    'collaboration',
    'competition',
    'studio_booking',
    'recording',
    'birthday',
    'festival',
  ]),
  title: z.string().min(1, 'Reminder title is required').max(200),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  bio: z.string().max(500).optional(),
  instagramHandle: z.string().max(100).optional(),
  youtubeChannelId: z.string().max(100).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const messageFormSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
});

export type MessageFormValues = z.infer<typeof messageFormSchema>;
