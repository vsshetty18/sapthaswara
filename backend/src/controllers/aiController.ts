import { Request, Response, NextFunction } from 'express';
import openaiService from '../services/openaiService';
import SongModel from '../models/Song';
import UserModel from '../models/User';
import AnalyticsModel from '../models/Analytics';
import { aiCoachRequestSchema, validateRequest } from '../utils/validators';
import { pool } from '../config/db';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

const logAiUsage = async (userId: string, requestType: string, context: any, responseText: string) => {
  // Rough token/cost estimate — replace with actual usage from OpenAI response if available
  const estimatedTokens = Math.ceil((responseText.length + JSON.stringify(context).length) / 4);
  const estimatedCost = (estimatedTokens / 1000) * 0.00015;

  await pool.query(
    `INSERT INTO ai_coach_logs (user_id, request_type, prompt_context, response_text, tokens_used, cost_usd)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, requestType, JSON.stringify(context), responseText, estimatedTokens, estimatedCost]
  );

  await pool.query(
    `INSERT INTO api_usage_logs (service, endpoint, user_id, cost_usd, status_code)
     VALUES ('openai', $1, $2, $3, 200)`,
    [requestType, userId, estimatedCost]
  );
};

const buildContext = async (userId: string) => {
  const { songs } = await SongModel.findMany({ userId, page: 1, limit: 50, offset: 0 });
  const instagramSnapshot = await AnalyticsModel.getLatestSnapshot(userId, 'instagram');
  const youtubeSnapshot = await AnalyticsModel.getLatestSnapshot(userId, 'youtube');
  return { userId, songs, instagramStats: instagramSnapshot, youtubeStats: youtubeSnapshot };
};

const handleAiRequest = (
  requestType: string,
  handler: (context: any, body: any) => Promise<string>
) => async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const context = await buildContext(userId);
    const responseText = await handler(context, req.body || {});

    await logAiUsage(userId, requestType, req.body || {}, responseText);

    return res.status(200).json({
      success: true,
      data: { requestType, responseText, createdAt: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
};

export const suggestSong = handleAiRequest('song_suggestion', (ctx) =>
  openaiService.suggestSongToUpload(ctx)
);

export const suggestPractice = handleAiRequest('practice_suggestion', (ctx) =>
  openaiService.suggestPracticeToday(ctx)
);

export const trendingSong = handleAiRequest('trending_song', (_ctx, body) =>
  openaiService.trendingSongSuggestion(body.language)
);

export const hashtags = handleAiRequest('hashtags', (_ctx, body) =>
  openaiService.suggestHashtags(body.songTitle, body.mood, body.language)
);

export const uploadTiming = handleAiRequest('upload_timing', (ctx) =>
  openaiService.bestUploadTiming(ctx)
);

export const caption = handleAiRequest('caption', (_ctx, body) =>
  openaiService.generateCaption(body.songTitle, body.mood, body.tone)
);

export const thumbnailIdeas = handleAiRequest('thumbnail', (_ctx, body) =>
  openaiService.thumbnailIdeas(body.songTitle)
);

export const coverImageIdeas = handleAiRequest('cover_image', (_ctx, body) =>
  openaiService.coverImageIdeas(body.songTitle, body.mood)
);

export const reelIdeas = handleAiRequest('reel_ideas', (ctx) =>
  openaiService.reelIdeas(ctx)
);

export const collaborationSuggestions = handleAiRequest('collaboration', (ctx) =>
  openaiService.collaborationSuggestions(ctx)
);

export const liveSessionSuggestions = handleAiRequest('live_session', (ctx) =>
  openaiService.liveSessionSuggestions(ctx)
);

export const audienceAnalysis = handleAiRequest('audience_analysis', (ctx) =>
  openaiService.audienceAnalysis(ctx)
);

export const performanceReview = handleAiRequest('performance_review', (ctx) =>
  openaiService.performanceReview(ctx)
);

export const motivation = handleAiRequest('motivation', (ctx) =>
  openaiService.dailyMotivation(ctx)
);

export const growthPrediction = handleAiRequest('growth_prediction', (ctx) =>
  openaiService.growthPrediction(ctx)
);

export const careerSuggestions = handleAiRequest('career_suggestions', (ctx, body) =>
  openaiService.careerSuggestions({ ...ctx, goal: body.goal })
);

export const handleGenericRequest = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(aiCoachRequestSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const routeMap: Record<string, (ctx: any, body: any) => Promise<string>> = {
      song_suggestion: (ctx) => openaiService.suggestSongToUpload(ctx),
      practice_suggestion: (ctx) => openaiService.suggestPracticeToday(ctx),
      trending_song: (_ctx, body) => openaiService.trendingSongSuggestion(body.language),
      hashtags: (_ctx, body) => openaiService.suggestHashtags(body.songTitle, body.mood, body.language),
      upload_timing: (ctx) => openaiService.bestUploadTiming(ctx),
      caption: (_ctx, body) => openaiService.generateCaption(body.songTitle, body.mood, body.tone),
      thumbnail: (_ctx, body) => openaiService.thumbnailIdeas(body.songTitle),
      cover_image: (_ctx, body) => openaiService.coverImageIdeas(body.songTitle, body.mood),
      reel_ideas: (ctx) => openaiService.reelIdeas(ctx),
      collaboration: (ctx) => openaiService.collaborationSuggestions(ctx),
      live_session: (ctx) => openaiService.liveSessionSuggestions(ctx),
      audience_analysis: (ctx) => openaiService.audienceAnalysis(ctx),
      performance_review: (ctx) => openaiService.performanceReview(ctx),
      motivation: (ctx) => openaiService.dailyMotivation(ctx),
      growth_prediction: (ctx) => openaiService.growthPrediction(ctx),
      career_suggestions: (ctx, body) => openaiService.careerSuggestions({ ...ctx, goal: body.goal }),
    };

    const { requestType, context: bodyContext } = validation.data;
    const handler = routeMap[requestType];
    const userId = req.user!.userId;
    const context = await buildContext(userId);

    const responseText = await handler(context, bodyContext || {});
    await logAiUsage(userId, requestType, bodyContext || {}, responseText);

    return res.status(200).json({
      success: true,
      data: { requestType, responseText, createdAt: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
};
