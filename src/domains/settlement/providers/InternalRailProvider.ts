import { Decimal } from '../../../shared/types';
import { SettlementJob } from '../models/SettlementModels';
import { 
  ISettlementProvider,
  SettlementResult, 
  SettlementStatus, 
  VerificationResult, 
  HealthCheckResult, 
  FeeEstimate, 
  SettlementCorridor, 
  ProviderConstraints 
} from './ISettlementProvider';
import { TreasuryService } from '../../treasury/services/TreasuryService';

export class InternalRailProvider implements ISettlementProvider {
  
  constructor(private treasury: TreasuryService) {}

  async init(): Promise<void> {
    console.log("InternalRailProvider initialized");
  }
  
  async healthCheck(): Promise<HealthCheckResult> {
    return { status: 'healthy', latencyMs: 5, lastChecked: new Date() };
  }
  
  async send(settlement: SettlementJob): Promise<SettlementResult> {
    // With internal rail, the actual money doesn't move externally here. 
    // The TreasuryService handles the ledger entries for the pool balancing.
    
    return {
      status: 'success',
      reference: `internal_${settlement.transactionId}`,
      provider: 'internal',
      actualFee: new Decimal(0), // No external fees
      timestamp: new Date()
    };
  }
  
  async getStatus(reference: string): Promise<SettlementStatus> {
    return { status: 'confirmed', actualFee: new Decimal(0) };
  }
  
  async verify(reference: string): Promise<VerificationResult> {
    return { verified: true, providerReference: reference };
  }
  
  async getBalance(currency: string): Promise<Decimal> {
    // Get balance from global treasury pool?
    return new Decimal(999999999);
  }
  
  async canSettle(amount: Decimal, currency: string): Promise<boolean> {
    // Ask treasury if there's enough liquidity in the specific pool
    // Need sender/receiver country, assuming provided by context or job
    return true; 
  }
  
  async estimateFee(amount: Decimal, currency: string): Promise<FeeEstimate> {
    return {
      estimatedFeeNative: new Decimal(0),
      estimatedFeeUSD: new Decimal(0),
      confidence: 'very_high',
      validUntil: new Date(Date.now() + 86400000)
    };
  }
  
  async estimateSettlementTime(amount: Decimal): Promise<string> {
    return 'instant';
  }
  
  async getSupportedCorridors(): Promise<SettlementCorridor[]> {
    return []; // Internal supports any corridor as long as pools exist
  }
  
  async supportsRoute(fromCurrency: string, toCurrency: string): Promise<boolean> {
    // Internal rail supports all if pools are funded. Handled by treasury check.
    return true;
  }
  
  async getConstraints(): Promise<ProviderConstraints> {
    return {
      maxTransferAmount: new Decimal(1000000), // Larger for internal
      minTransferAmount: new Decimal(1),
      requiresKYC: true,
      supportedCurrencies: [] // All
    };
  }
}
