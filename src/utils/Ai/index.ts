import { config } from 'dotenv';
import { OpenAI } from 'langchain/llms/openai';
config();

export const openAIApiKey = process.env['OPEN_AI_API_KEY'];

export function getOpenAi() {
  return new OpenAI(
    {
      modelName: 'gpt-4-0613',
      openAIApiKey: openAIApiKey,
      temperature: 0,
    },
    {
      basePath:
        'https://chat-gpt-next-qwn676aj7-mrxyy.vercel.app/api/openai/v1/',
    },
  );
}
