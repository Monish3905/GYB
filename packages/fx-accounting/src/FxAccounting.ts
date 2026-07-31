import { Ledger } from '@payment-os/ledger';

export interface FxRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  timestamp: Date;
}

export class FxAccounting {
  constructor(private ledger: Ledger) {}

  public calculateRealizedGainLoss(
    fromCurrency: string, 
    toCurrency: string, 
    originalRate: number, 
    settlementRate: number, 
    amount: number
  ): number {
    const originalValue = amount * originalRate;
    const settlementValue = amount * settlementRate;
    return settlementValue - originalValue; // Positive is gain, negative is loss
  }

  // Future multi-currency reporting logic would rely on historical journals
}
