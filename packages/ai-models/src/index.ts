export interface AIModel { modelId: string; version: string; status: string; }
export class ModelRegistry {
  private models: Map<string, AIModel> = new Map();
}
