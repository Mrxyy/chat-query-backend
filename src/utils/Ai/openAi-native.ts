import OpenAI from 'openai';

const CLOUDFLARE_ACCOUNT_ID = 'dca3878ae5639a67e8663846e4c3ce90';
const CLOUDFLARE_API_KEY = '2mto3Yyi00rh0ZYc6kEtXaSe0afXSgcFWRzAIXu1';

export const ollamaOpenAi = new OpenAI({
  baseURL: 'http://127.0.0.1:11434/v1/',

  // required but ignored
  apiKey: 'ollama',
});

export const cloudflareOpenAi = new OpenAI({
  apiKey: CLOUDFLARE_API_KEY,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
});

export const huggingfaceOpenAi = new OpenAI({
  baseURL: 'http://localhost:8000/v1/',

  // required but ignored
  apiKey: 'huggingface',
});

export const openAi = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  baseURL: process.env.BASE_URL,
});
