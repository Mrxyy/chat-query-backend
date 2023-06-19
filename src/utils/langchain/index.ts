import { Injectable } from '@nestjs/common';
import { OpenAI } from 'langchain/llms/openai';

class LangChain {
  model = new OpenAI({ openAIApiKey: 'sk-...', temperature: 0.9 });
}
