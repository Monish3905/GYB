export interface CorridorConfig {
  sourceCountry: string;
  destinationCountry: string;
  sourceCurrency: string;
  destinationCurrency: string;
  transactionLimit: number;
  requiresKYC: boolean;
  requiresAML: boolean;
  fxProviderId: string;
  settlementProviderId: string;
}

export class UkIndiaCorridor {
  public static getConfig(): CorridorConfig {
    return {
      sourceCountry: 'UK',
      destinationCountry: 'IN',
      sourceCurrency: 'GBP',
      destinationCurrency: 'INR',
      transactionLimit: 50000,
      requiresKYC: true,
      requiresAML: true,
      fxProviderId: 'internal-fx-treasury',
      settlementProviderId: 'sandbox-india-psp' // Replaced in production
    };
  }

  public static validate(amount: number, src: string, dest: string): boolean {
    const config = this.getConfig();
    if (src !== config.sourceCurrency || dest !== config.destinationCurrency) {
      return false;
    }
    if (amount > config.transactionLimit) {
      return false;
    }
    return true;
  }
}
