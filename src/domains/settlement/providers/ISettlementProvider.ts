import { Decimal } from '../../../shared/types';
import { SettlementJob } from './SettlementModels';

export interface SettlementResult {
  status: 'success' | 'pending' | 'failed';
  reference: string;                  // Tx hash, bank ref, etc.
  provider: string;
  actualFee: Decimal;
  timestamp: Date;
  confirmations?: number;
  errorMessage?: string;
  isRetryable?: boolean;
}

export interface SettlementStatus {
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  confirmations?: number;
  blockHeight?: number;
  actualFee?: Decimal;
}

export interface VerificationResult {
  verified: boolean;
  settledAmount?: Decimal;
  settledCurrency?: string;
  providerReference: string;
  discrepancy?: string;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  message?: string;
  lastChecked: Date;
}

export interface FeeEstimate {
  estimatedFeeNative: Decimal;
  estimatedFeeUSD: Decimal;
  confidence: 'low' | 'medium' | 'high';
  validUntil: Date;
}

export interface SettlementCorridor {
  fromCurrency: string;
  toCurrency: string;
  isAvailable: boolean;
  minAmount: Decimal;
  maxAmount: Decimal;
}

export interface ProviderConstraints {
  maxTransferAmount: Decimal;
  minTransferAmount: Decimal;
  dailyVolumeLimit?: Decimal;
  requiresKYC: boolean;
  supportedCurrencies: string[];
}

/**
 * Every settlement rail (internal, blockchain, bank) implements this interface.
 * This ensures pluggable, testable, and swappable providers.
 */
export interface ISettlementProvider {
  /** Initialize the provider (validate config, connect to RPC, etc.) */
  init(): Promise<void>;
  
  /** Health check endpoint (called by monitoring) */
  healthCheck(): Promise<HealthCheckResult>;
  
  /** Execute a settlement transfer */
  send(settlement: SettlementJob): Promise<SettlementResult>;
  
  /** Query the status of a settlement */
  getStatus(reference: string): Promise<SettlementStatus>;
  
  /** Verify that a transfer actually happened on the settlement layer */
  verify(reference: string): Promise<VerificationResult>;
  
  /** Get current balance available for settlement */
  getBalance(currency: string): Promise<Decimal>;
  
  /** Check if provider can settle this amount */
  canSettle(amount: Decimal, currency: string): Promise<boolean>;
  
  /** Estimate settlement fee for this amount */
  estimateFee(amount: Decimal, currency: string): Promise<FeeEstimate>;
  
  /** Estimate settlement time */
  estimateSettlementTime(amount: Decimal): Promise<string>;
  
  /** List all supported currency pairs */
  getSupportedCorridors(): Promise<SettlementCorridor[]>;
  
  /** Check if this provider can settle a specific corridor */
  supportsRoute(fromCurrency: string, toCurrency: string): Promise<boolean>;
  
  /** Get rate limits and constraints for this provider */
  getConstraints(): Promise<ProviderConstraints>;
}
