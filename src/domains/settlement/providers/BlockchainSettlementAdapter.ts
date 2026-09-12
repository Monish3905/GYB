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
      // In a real system, we'd fetch the actual destination from the database based on the recipient wallet.
      // For testing, we allow passing it via metadata if available, otherwise fallback to a mock address
      // just so the transaction builds (though it might fail if unfunded).
      const destinationAddress = (settlement as any).metadata?.destinationAddress || '11111111111111111111111111111111'; // System program ID as fallback safe address
      
      const treasuryPubkey = process.env.TREASURY_SOLANA_PUBKEY;
      const treasurySecret = process.env.TREASURY_SOLANA_SECRET;
      
      if (!treasuryPubkey || !treasurySecret) {
         throw new Error("Missing TREASURY_SOLANA_PUBKEY or TREASURY_SOLANA_SECRET in environment");
      }

      // 1. Build Transaction
      const tx = await this.chainProvider.buildTransaction({
        from: treasuryPubkey,
        to: destinationAddress,
        amount: settlement.amount.toNumber(),
        asset: settlement.currency
      });

      // 2. Sign using real treasury keypair
      const treasurySigner = { 
        sign: async (msg: Uint8Array) => {
           const { Keypair } = require('@solana/web3.js');
           const nacl = require('tweetnacl');
           const kp = Keypair.fromSecretKey(Buffer.from(treasurySecret!, 'hex'));
           const signature = nacl.sign.detached(msg, kp.secretKey);
           return Buffer.from(signature).toString('hex');
        }, 
        getPublicKey: async () => treasuryPubkey,
        signMessage: async (msg: Uint8Array) => {
           const { Keypair } = require('@solana/web3.js');
           const nacl = require('tweetnacl');
           const kp = Keypair.fromSecretKey(Buffer.from(treasurySecret!, 'hex'));
           const signature = nacl.sign.detached(msg, kp.secretKey);
           return Buffer.from(signature).toString('hex');
        }
      };
      
      const signedTx = await this.chainProvider.signTransaction(tx, treasurySigner);

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
    const treasuryPubkey = process.env.TREASURY_SOLANA_PUBKEY;
    if (!treasuryPubkey) throw new Error('Missing TREASURY_SOLANA_PUBKEY in environment');
    const balStr = await this.chainProvider.getBalance(treasuryPubkey, currency);
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
