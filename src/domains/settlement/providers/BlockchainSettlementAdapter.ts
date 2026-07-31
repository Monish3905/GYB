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
import { IChainProvider } from '../../../../../packages/blockchain-sdk/src/interfaces/IChainProvider';

export class BlockchainSettlementAdapter implements ISettlementProvider {
  constructor(private chainProvider: IChainProvider, private chainName: string) {}

  async init(): Promise<void> {
    await this.chainProvider.initialize();
  }
  
  async healthCheck(): Promise<HealthCheckResult> {
    const isHealthy = await this.chainProvider.health();
    return {
      status: isHealthy ? 'healthy' : 'down',
      latencyMs: 50,
      lastChecked: new Date()
    };
  }
  
  async send(settlement: SettlementJob): Promise<SettlementResult> {
    try {
      // 1. Build Transaction
      const tx = await this.chainProvider.buildTransaction({
        // Stub: Normally we look up the vault address for 'from' and destination for 'to'
        from: 'treasury_vault',
        to: 'destination_address',
        amount: settlement.amount.toNumber()
      });

      // 2. Sign (Stub: using a mock signer)
      const mockSigner = { 
        sign: async () => 'mock_sig', 
        getPublicKey: async () => 'mock_pub',
        signMessage: async () => 'mock_msg'
      };
      const signedTx = await this.chainProvider.signTransaction(tx, mockSigner);

      // 3. Broadcast
      const txHash = await this.chainProvider.broadcastTransaction(signedTx);

      return {
        status: 'pending',
        reference: txHash,
        provider: this.chainName,
        actualFee: new Decimal(0), // Would parse from receipt
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        status: 'failed',
        reference: '',
        provider: this.chainName,
        actualFee: new Decimal(0),
        timestamp: new Date(),
        errorMessage: error.message,
        isRetryable: true
      };
    }
  }
  
  async getStatus(reference: string): Promise<SettlementStatus> {
    // In a real system, the ChainMonitor updates this asynchronously
    const isVerified = await this.chainProvider.verifyTransaction(reference);
    return {
      status: isVerified ? 'confirmed' : 'pending',
      confirmations: isVerified ? 1 : 0
    };
  }
  
  async verify(reference: string): Promise<VerificationResult> {
    const isVerified = await this.chainProvider.verifyTransaction(reference);
    return {
      verified: isVerified,
      providerReference: reference
    };
  }
  
  async getBalance(currency: string): Promise<Decimal> {
    // Stub address
    const balStr = await this.chainProvider.getBalance('treasury_vault', currency);
    return new Decimal(balStr);
  }
  
  async canSettle(amount: Decimal, currency: string): Promise<boolean> {
    const capabilities = this.chainProvider.capabilities();
    return capabilities.supportedAssets.includes(currency);
  }
  
  async estimateFee(amount: Decimal, currency: string): Promise<FeeEstimate> {
    const fee = await this.chainProvider.estimateFee({});
    return {
      estimatedFeeNative: new Decimal(fee),
      estimatedFeeUSD: new Decimal(fee), // Assume 1:1 for stub
      confidence: 'medium',
      validUntil: new Date(Date.now() + 10000)
    };
  }
  
  async estimateSettlementTime(amount: Decimal): Promise<string> {
    const ms = await this.chainProvider.estimateConfirmationTime({});
    return `${ms / 1000} seconds`;
  }
  
  async getSupportedCorridors(): Promise<SettlementCorridor[]> {
    const capabilities = this.chainProvider.capabilities();
    const corridors: SettlementCorridor[] = [];
    
    // Cross product of supported assets
    for (const asset of capabilities.supportedAssets) {
      corridors.push({
        fromCurrency: asset,
        toCurrency: asset,
        isAvailable: true,
        minAmount: new Decimal(0),
        maxAmount: new Decimal(capabilities.maximumTransactionSize === 'Unlimited' ? 999999 : capabilities.maximumTransactionSize)
      });
    }
    return corridors;
  }
  
  async supportsRoute(fromCurrency: string, toCurrency: string): Promise<boolean> {
    const capabilities = this.chainProvider.capabilities();
    return capabilities.supportedAssets.includes(fromCurrency) && capabilities.supportedAssets.includes(toCurrency);
  }
  
  async getConstraints(): Promise<ProviderConstraints> {
    const capabilities = this.chainProvider.capabilities();
    return {
      maxTransferAmount: new Decimal(capabilities.maximumTransactionSize === 'Unlimited' ? 999999 : capabilities.maximumTransactionSize),
      minTransferAmount: new Decimal(0),
      requiresKYC: true,
      supportedCurrencies: capabilities.supportedAssets
    };
  }
}
