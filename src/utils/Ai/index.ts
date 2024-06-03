import { config } from 'dotenv';
import { OpenAI, ChatOpenAI } from '@langchain/openai';
config();

export const openAIApiKey = process.env['OPEN_AI_API_KEY'];
export const modelName = process.env['MODEL_NAME'];
export const basePath = process.env['BASE_URL'];

export function getOpenAi() {
  return new OpenAI(
    {
      modelName: modelName,
      openAIApiKey: openAIApiKey,
      temperature: 0.8,
    },
    {
      basePath: basePath,
    },
  );
}

export function getChatOpenAi() {
  return new ChatOpenAI(
    {
      modelName: modelName,
      openAIApiKey: openAIApiKey,
      temperature: 0,
    },
    {
      basePath: basePath,
    },
  );
}
