export interface TransactionMonitorProfile {
  customerId: string;
  dailyVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  transactionCount: number;
  avgAmount: number;
  uniqueDestinations: Set<string>;
  lastActivityAt: Date;
}

export class TransactionMonitor {
  private profiles: Map<string, TransactionMonitorProfile> = new Map();

  public record(customerId: string, amount: number, destination: string): void {
    let profile = this.profiles.get(customerId);
    if (!profile) {
      profile = {
        customerId,
        dailyVolume: 0,
        weeklyVolume: 0,
        monthlyVolume: 0,
        transactionCount: 0,
        avgAmount: 0,
        uniqueDestinations: new Set(),
        lastActivityAt: new Date()
      };
      this.profiles.set(customerId, profile);
    }

    profile.dailyVolume += amount;
    profile.weeklyVolume += amount;
    profile.monthlyVolume += amount;
    profile.transactionCount++;
    profile.avgAmount = profile.monthlyVolume / profile.transactionCount;
    profile.uniqueDestinations.add(destination);
    profile.lastActivityAt = new Date();
  }

  public getProfile(customerId: string): TransactionMonitorProfile | undefined {
    return this.profiles.get(customerId);
  }
}
