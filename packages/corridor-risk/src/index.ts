export class CorridorRiskEvaluator {
  private corridorRisks: Map<string, number> = new Map();
  public setCorridor(from: string, to: string, risk: number): void { this.corridorRisks.set(${from}-, risk); }
  public evaluate(from: string, to: string): number { return this.corridorRisks.get(${from}-) ?? 20; }
}
