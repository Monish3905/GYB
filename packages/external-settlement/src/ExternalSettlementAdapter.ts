export interface SettlementRequest {
  requestId: string;
  transactionId: string;
  amount: number;
  currency: string;
  beneficiary: any;
}

export interface SettlementResult {
  success: boolean;
  providerReference?: string;
  errorCode?: string;
}

export interface ExternalSettlementAdapter {
  quote(sourceAmount: number, sourceCurrency: string, destCurrency: string): Promise<number>;
  validateBeneficiary(beneficiary: any): Promise<boolean>;
  reserveLiquidity(amount: number, currency: string): Promise<boolean>;
  initiateSettlement(request: SettlementRequest): Promise<SettlementResult>;
  getSettlementStatus(providerRef: string): Promise<string>;
  cancel(providerRef: string): Promise<boolean>;
  reverse(providerRef: string): Promise<boolean>;
  reconcile(providerRef: string): Promise<boolean>;
}
