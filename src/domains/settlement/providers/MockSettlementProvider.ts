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

export class MockSettlementProvider implements ISettlementProvider {
  
  async init(): Promise<void> {
    console.log("MockSettlementProvider initialized");
  }
  
  async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: 'healthy',
      latencyMs: 15,
      lastChecked: new Date()
    };
  }
  
  async send(settlement: SettlementJob): Promise<SettlementResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      status: 'success',
      reference: `mock_ref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      provider: 'mock',
      actualFee: new Decimal(2.50), // Mock $2.50 fee
      timestamp: new Date()
    };
  }
  
  async getStatus(reference: string): Promise<SettlementStatus> {
    return {
      status: 'confirmed',
      confirmations: 1,
      actualFee: new Decimal(2.50)
    };
  }
  
  async verify(reference: string): Promise<VerificationResult> {
    return {
      verified: true,
      providerReference: reference
    };
  }
  
  async getBalance(currency: string): Promise<Decimal> {
    return new Decimal(1000000); // Infinite mock balance
  }
  
  async canSettle(amount: Decimal, currency: string): Promise<boolean> {
    return true; // Mock can always settle
  }
  
  async estimateFee(amount: Decimal, currency: string): Promise<FeeEstimate> {
    return {
      estimatedFeeNative: new Decimal(2.50),
      estimatedFeeUSD: new Decimal(2.50),
      confidence: 'high',
      validUntil: new Date(Date.now() + 60000)
    };
  }
  
  async estimateSettlementTime(amount: Decimal): Promise<string> {
    return '1 business day';
  }
  
  async getSupportedCorridors(): Promise<SettlementCorridor[]> {
    return [
      { fromCurrency: 'USD', toCurrency: 'INR', isAvailable: true, minAmount: new Decimal(10), maxAmount: new Decimal(10000) },
      { fromCurrency: 'EUR', toCurrency: 'USD', isAvailable: true, minAmount: new Decimal(10), maxAmount: new Decimal(10000) }
    ];
  }
  
  async supportsRoute(fromCurrency: string, toCurrency: string): Promise<boolean> {
    const corridors = await this.getSupportedCorridors();
    return corridors.some(c => c.fromCurrency === fromCurrency && c.toCurrency === toCurrency && c.isAvailable);
  }
  
  async getConstraints(): Promise<ProviderConstraints> {
    return {
      maxTransferAmount: new Decimal(10000),
      minTransferAmount: new Decimal(10),
      requiresKYC: true,
      supportedCurrencies: ['USD', 'INR', 'EUR']
    };
  }
}
