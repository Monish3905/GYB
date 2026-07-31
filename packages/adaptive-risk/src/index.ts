export class AdaptiveRiskEngine {
  public calculate(ruleScore: number, mlScore: number): number {
    return Math.round((ruleScore * 0.70) + (mlScore * 0.30));
  }
}
