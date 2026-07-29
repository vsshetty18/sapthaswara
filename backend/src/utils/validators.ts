import { z } from 'zod';

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const songSchema = z.object({
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
  tags: z.array(z.string()).optional(),
  lyrics: z.string().optional(),
});

export const playlistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100),
  description: z.string().max(500).optional(),
  songIds: z.array(z.string().uuid()).optional(),
});

export const plannerTaskSchema = z.object({
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
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

export const reminderSchema = z.object({
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
  scheduledTime: z.string().datetime(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
});

export const instagramHandleSchema = z.object({
  handle: z
    .string()
    .min(1, 'Instagram handle is required')
    .regex(/^[a-zA-Z0-9._]+$/, 'Invalid Instagram handle format'),
});

export const youtubeChannelSchema = z.object({
  channelHandle: z.string().min(1, 'YouTube channel handle is required'),
});

export const aiCoachRequestSchema = z.object({
  requestType: z.enum([
    'song_suggestion',
    'practice_suggestion',
    'trending_song',
    'hashtags',
    'upload_timing',
    'caption',
    'thumbnail',
    'cover_image',
    'reel_ideas',
    'collaboration',
    'live_session',
    'audience_analysis',
    'performance_review',
    'motivation',
    'growth_prediction',
    'career_suggestions',
  ]),
  context: z.record(z.any()).optional(),
});

export const communityMessageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  content: z.string().min(1, 'Message cannot be empty').max(2000),
});

export const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return { success: false as const, errors };
  }
  return { success: true as const, data: result.data };
};
