import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing required environment variable: OPENAI_API_KEY');
}

export const config = {
  apiKey: process.env.OPENAI_API_KEY as string,
  defaultModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxRetries: 2,
  timeoutMs: 30000,
};
