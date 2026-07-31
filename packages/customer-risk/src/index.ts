export class CustomerRiskEvaluator {
  public evaluate(kycStatus: string, accountAge: number, pepMatch: boolean): number {
    let score = 0;
    if (kycStatus !== 'VERIFIED') score += 40;
    if (accountAge < 30) score += 20;
    if (pepMatch) score += 50;
    return Math.min(score, 100);
  }
}
