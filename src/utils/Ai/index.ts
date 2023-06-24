import { config } from 'dotenv';
import { ChatOpenAI } from 'langchain/chat_models/openai';
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
      basePath: 'https://chat-query-backend.netlify.app/api/openai/v1',
    },
  );
}

export function getChatOpenAi() {
  return new ChatOpenAI(
    {
      // modelName: 'gpt-4-0613',
      openAIApiKey: openAIApiKey,
    },
    {
      basePath: 'https://chat-query-backend.netlify.app/api/openai/v1',
    },
  );
}
