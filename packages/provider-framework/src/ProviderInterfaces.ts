export interface IExecutionProvider {
  getProviderId(): string;
  getProviderType(): string; // 'BLOCKCHAIN' | 'BANK' | 'CARD' | 'WALLET'
  executePayment(request: PaymentExecutionRequest): Promise<PaymentExecutionResponse>;
  checkStatus(transactionId: string): Promise<PaymentExecutionStatus>;
}

export interface PaymentExecutionRequest {
  paymentId: string;
  sourceCurrency: string;
  destinationCurrency: string;
  amount: number;
  sourceAccount: any;
  destinationAccount: any;
  metadata?: Record<string, string>;
}

export interface PaymentExecutionResponse {
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  estimatedCompletionTime?: Date;
  networkFee?: number;
}

export interface PaymentExecutionStatus {
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  confirmations?: number;
  failureReason?: string;
}

export interface ICapabilityProvider {
  getSupportedCurrencies(): string[];
  getSupportedCountries(): string[];
  getLimits(currency: string): { min: number; max: number };
}

export interface IHealthProvider {
  isHealthy(): Promise<boolean>;
  getLatency(): Promise<number>;
}

export interface IQuoteProvider {
  getQuote(sourceCurrency: string, destCurrency: string, amount: number): Promise<FXQuote>;
}

export interface FXQuote {
  quoteId: string;
  exchangeRate: number;
  guaranteedUntil: Date;
  providerId: string;
}
