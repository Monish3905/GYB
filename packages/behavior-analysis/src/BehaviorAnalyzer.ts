export interface BehaviorProfile {
  customerId: string;
  averageTransactionAmount: number;
  typicalHoursOfActivity: number[];
  typicalDestinations: string[];
  riskDrift: number; // 0-100 how much current behavior deviates from baseline
}

export class BehaviorAnalyzer {
  private profiles: Map<string, BehaviorProfile> = new Map();

  public baseline(profile: BehaviorProfile): void {
    this.profiles.set(profile.customerId, profile);
  }

  public analyzeDrift(customerId: string, amount: number, hour: number, destination: string): number {
    const profile = this.profiles.get(customerId);
    if (!profile) return 0; // No baseline = no drift score

    let drift = 0;
    if (amount > profile.averageTransactionAmount * 3) drift += 40;
    if (!profile.typicalHoursOfActivity.includes(hour)) drift += 20;
    if (!profile.typicalDestinations.includes(destination)) drift += 20;

    return Math.min(drift, 100);
  }
}
