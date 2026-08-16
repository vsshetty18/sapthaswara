import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY');
}

/**
 * NOTE: This project currently runs on Groq's free API tier instead of
 * OpenAI's paid API, since Groq exposes an OpenAI-compatible /v1/chat/completions
 * endpoint. The env var is still named OPENAI_API_KEY for compatibility with
 * the rest of the codebase — it just holds a Groq key (starts with "gsk_").
 * To switch back to real OpenAI later, just change baseURL to
 * "https://api.openai.com/v1" and defaultModel to an OpenAI model name.
 */
export const config = {
  apiKey: process.env.OPENAI_API_KEY as string,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1',
  defaultModel: process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile',
  maxRetries: 2,
  timeoutMs: 30000,
};
