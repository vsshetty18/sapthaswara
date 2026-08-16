import OpenAI from 'openai';
import { config } from '../config/openai';
import logger from '../utils/logger';

const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL,
});

export interface AIRequestContext {
  userId: string;
  songs?: any[];
  analytics?: any;
  instagramStats?: any;
  youtubeStats?: any;
  goal?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are SvaraVerse AI Coach, a world-class music career mentor for Indian singers, playback singer aspirants, and music creators. 
You give practical, encouraging, and specific advice about practice, song selection, social media growth, content strategy, and career development. 
Keep responses concise, actionable, and warm in tone. Use the user's data (songs, analytics, social stats) whenever provided to personalize advice.`;

class OpenAIService {
  private model = config.defaultModel;

  private async chatCompletion(messages: ChatMessage[], maxTokens = 600): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error: any) {
      logger.error('OpenAI API error', { error: error.message });
      throw new Error('AI service temporarily unavailable');
    }
  }

  async suggestSongToUpload(context: AIRequestContext): Promise<string> {
    const songList = (context.songs || [])
      .map((s) => `${s.title} (Status: ${s.status}, Language: ${s.language}, Mood: ${s.mood})`)
      .join('\n');

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Here is my song library:\n${songList}\n\nWhich song should I upload today and why? Give one clear recommendation.`,
      },
    ];
    return this.chatCompletion(messages);
  }

  async suggestPracticeToday(context: AIRequestContext): Promise<string> {
    const songList = (context.songs || [])
      .filter((s) => s.status === 'need_improvement' || s.status === 'practiced')
      .map((s) => `${s.title} (${s.status})`)
      .join('\n');

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `My songs needing attention:\n${songList}\n\nWhat should I practice today? Suggest a focused 30-45 min practice plan.`,
      },
    ];
    return this.chatCompletion(messages);
  }

  async trendingSongSuggestion(language?: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest 3 currently trending ${language || 'Indian'} songs that would perform well if covered on Instagram Reels or YouTube Shorts right now, with a brief reason for each.`,
      },
    ];
    return this.chatCompletion(messages);
  }

  async suggestHashtags(songTitle: string, mood?: string, language?: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest 15 high-performing hashtags for a cover/performance post of the song "${songTitle}" (Mood: ${mood || 'N/A'}, Language: ${language || 'N/A'}). Mix broad, niche, and India-specific music tags. Return as a comma-separated list only.`,
      },
    ];
    return this.chatCompletion(messages, 300);
  }

  async bestUploadTiming(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Based on this engagement data: ${JSON.stringify(context.instagramStats || {})} and ${JSON.stringify(
          context.youtubeStats || {}
        )}, what is the best day and time to post today or this week? Be specific.`,
      },
    ];
    return this.chatCompletion(messages, 300);
  }

  async generateCaption(songTitle: string, mood?: string, tone?: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Write 3 caption options for an Instagram post of my cover of "${songTitle}" (Mood: ${mood || 'N/A'}). Tone: ${tone || 'heartfelt and engaging'}. Keep each under 200 characters.`,
      },
    ];
    return this.chatCompletion(messages, 400);
  }

  async thumbnailIdeas(songTitle: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest 5 YouTube thumbnail concepts for a cover video of "${songTitle}", describing composition, color palette, text overlay, and mood for each.`,
      },
    ];
    return this.chatCompletion(messages, 500);
  }

  async coverImageIdeas(songTitle: string, mood?: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest 5 album/cover image concepts for the song "${songTitle}" (Mood: ${mood || 'N/A'}), with visual style and color direction for each.`,
      },
    ];
    return this.chatCompletion(messages, 500);
  }

  async reelIdeas(context: AIRequestContext): Promise<string> {
    const songList = (context.songs || []).map((s) => s.title).join(', ');
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest 5 creative Instagram Reel concepts using my songs: ${songList}. Include hook idea, visual concept, and estimated length for each.`,
      },
    ];
    return this.chatCompletion(messages, 600);
  }

  async collaborationSuggestions(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Based on my profile and growth stage, suggest 4 types of collaborations (with other creators, musicians, or studios) that could help my career grow right now, with reasoning.`,
      },
    ];
    return this.chatCompletion(messages, 500);
  }

  async liveSessionSuggestions(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Suggest 3 live session formats/themes I could host this week to boost engagement, including ideal day/time and promotion tip for each.`,
      },
    ];
    return this.chatCompletion(messages, 400);
  }

  async audienceAnalysis(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze this audience data: ${JSON.stringify(
          context.instagramStats || {}
        )} ${JSON.stringify(context.youtubeStats || {})}. Summarize who my core audience is and how to serve them better.`,
      },
    ];
    return this.chatCompletion(messages, 500);
  }

  async performanceReview(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Review my recent performance data: ${JSON.stringify(
          context.analytics || {}
        )}. Give an honest, encouraging review with 3 concrete improvement areas.`,
      },
    ];
    return this.chatCompletion(messages, 500);
  }

  async dailyMotivation(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Give me a short, powerful motivational message for a music creator today. Make it personal and energizing, 2-3 sentences.`,
      },
    ];
    return this.chatCompletion(messages, 150);
  }

  async growthPrediction(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Based on this growth history: ${JSON.stringify(
          context.analytics || {}
        )}, predict my likely growth trajectory over the next 30-90 days and what could accelerate it.`,
      },
    ];
    return this.chatCompletion(messages, 500);
  }

  async careerSuggestions(context: AIRequestContext): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Given my goal: "${context.goal || 'become a successful playback singer'}", suggest a realistic 6-month career roadmap with milestones.`,
      },
    ];
    return this.chatCompletion(messages, 700);
  }
}

export default new OpenAIService();
