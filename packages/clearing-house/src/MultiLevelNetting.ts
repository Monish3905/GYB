import { IEventBus } from '@payment-os/events';

export type NettingLevel = 'CUSTOMER' | 'MERCHANT' | 'PROVIDER' | 'COUNTRY' | 'CURRENCY' | 'TREASURY' | 'BLOCKCHAIN' | 'REGIONAL' | 'GLOBAL';

export interface Obligation {
  id: string;
  source: string;
  destination: string;
  currency: string;
  amount: number;
}

export class MultiLevelNetting {
  constructor(private eventBus: IEventBus) {}

  public async net(level: NettingLevel, obligations: Obligation[]): Promise<Obligation[]> {
    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'NettingStarted',
      level
    } as any);

    // Multilateral netting logic (simplified for memory implementation)
    // Map of entity -> balance
    const balances = new Map<string, number>();

    for (const obs of obligations) {
      const srcBal = balances.get(obs.source) || 0;
      const destBal = balances.get(obs.destination) || 0;
      
      balances.set(obs.source, srcBal - obs.amount);
      balances.set(obs.destination, destBal + obs.amount);
    }

    // Resolve balances into minimal transfers
    // For simplicity, we just separate positive and negative balances and match them
    const debtors: { entity: string, amount: number }[] = [];
    const creditors: { entity: string, amount: number }[] = [];

    for (const [entity, balance] of balances.entries()) {
      if (balance < 0) {
        debtors.push({ entity, amount: -balance });
      } else if (balance > 0) {
        creditors.push({ entity, amount: balance });
      }
    }

    // Sort to optimize matching (largest to smallest)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const netObligations: Obligation[] = [];
    let d = 0, c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      
      const amount = Math.min(debtor.amount, creditor.amount);
      
      netObligations.push({
        id: crypto.randomUUID(),
        source: debtor.entity,
        destination: creditor.entity,
        currency: obligations[0]?.currency || 'USD', // Simplified for single currency netting
        amount
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) d++;
      if (creditor.amount === 0) c++;
    }

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'NettingCompleted',
      level,
      obligationsProcessed: obligations.length,
      netObligationsProduced: netObligations.length
    } as any);

    return netObligations;
  }
}
