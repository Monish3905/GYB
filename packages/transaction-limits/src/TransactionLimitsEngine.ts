export interface TransactionLimit {
  scope: 'CORRIDOR' | 'CUSTOMER' | 'BENEFICIARY' | 'PARTICIPANT' | 'GLOBAL';
  scopeReference: string;
  currency: string;
  maxPerTransaction: number;
  maxPerDay: number;
  maxPerRolling30d: number;
}

export class TransactionLimitsEngine {
  private limits: TransactionLimit[] = [];
  private dailyUsage: Map<string, number> = new Map();

  public addLimit(limit: TransactionLimit): void {
    this.limits.push(limit);
  }

  public evaluate(scope: string, scopeRef: string, currency: string, amount: number): { allowed: boolean; reason?: string } {
    const applicable = this.limits.filter(
      l => l.scope === scope && l.scopeReference === scopeRef && l.currency === currency
    );

    for (const limit of applicable) {
      if (amount > limit.maxPerTransaction) {
        return { allowed: false, reason: `Exceeds per-transaction limit of ${limit.maxPerTransaction} ${currency}` };
      }

      const usageKey = `${scope}-${scopeRef}-${currency}-daily`;
      const currentUsage = this.dailyUsage.get(usageKey) || 0;
      if (currentUsage + amount > limit.maxPerDay) {
        return { allowed: false, reason: `Exceeds daily limit of ${limit.maxPerDay} ${currency}` };
      }
    }

    return { allowed: true };
  }

  public recordUsage(scope: string, scopeRef: string, currency: string, amount: number): void {
    const usageKey = `${scope}-${scopeRef}-${currency}-daily`;
    const current = this.dailyUsage.get(usageKey) || 0;
    this.dailyUsage.set(usageKey, current + amount);
  }
}
