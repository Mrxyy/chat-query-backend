import jsExecutor from './executor/js';

export class ExecutionService {
  async executeJsFunction(id: string, content: string, data: any) {
    return await jsExecutor(id, content, data);
  }
}
