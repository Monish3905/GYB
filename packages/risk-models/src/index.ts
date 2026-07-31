export interface RiskModel { modelId: string; name: string; version: string; weights: Record<string,number>; }
export class RiskModelRegistry {
  private models: Map<string, RiskModel> = new Map();
  public register(m: RiskModel): void { this.models.set(m.modelId, m); }
  public getModel(id: string): RiskModel | undefined { return this.models.get(id); }
}
