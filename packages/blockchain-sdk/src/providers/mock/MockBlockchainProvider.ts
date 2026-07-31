import { IChainProvider, ProviderCapabilities } from '../../interfaces/IChainProvider';

export class MockBlockchainProvider implements IChainProvider {
  async initialize(): Promise<void> {}
  
  async health(): Promise<boolean> { return true; }
  
  capabilities(): ProviderCapabilities {
    return {
      supportedAssets: ['USD', 'EUR'],
      supportedChains: ['mock_chain'],
      supportedBridges: [],
      supportedSwaps: [],
      settlementSpeed: '5 seconds',
      maximumTransactionSize: '1000000',
      regions: ['Global'],
      feeModel: 'fixed',
      liquidityAvailability: 'high',
      batchSupport: false,
      streamingSupport: false,
      nativeTokens: ['MOCK'],
      stablecoins: ['USD', 'EUR']
    };
  }

  async estimateFee(payload: any): Promise<any> { return "0.01"; }
  async estimateConfirmationTime(payload: any): Promise<number> { return 5000; }
  
  async createWallet(params: any): Promise<any> { return { address: 'mock_address', publicKey: 'mock_pub' }; }
  async importWallet(privateKey: string): Promise<any> { return { address: 'mock_imported_address' }; }
  validateAddress(address: string): boolean { return address.startsWith('mock_'); }
  
  async buildTransaction(params: any): Promise<any> { return { raw: 'mock_tx_data' }; }
  async signTransaction(tx: any, signer: any): Promise<any> { return { ...tx, signed: true }; }
  async broadcastTransaction(tx: any): Promise<string> { return 'mock_tx_hash'; }
  
  async trackTransaction(txHash: string): Promise<void> {}
  async verifyTransaction(txHash: string): Promise<boolean> { return true; }
  async cancelTransaction(txHash: string): Promise<boolean> { return false; }
  
  async getBalance(address: string, asset?: string): Promise<string> { return "1000"; }
  async reserveLiquidity(params: any): Promise<any> { return true; }
  async releaseLiquidity(params: any): Promise<any> { return true; }
  
  async transfer(params: any): Promise<string> { return 'mock_tx_hash'; }
  async rollback(params: any): Promise<boolean> { return true; }
  
  supportsAsset(asset: string): boolean { return ['USD', 'EUR'].includes(asset); }
  supportsBridge(): boolean { return false; }
  supportsSwap(): boolean { return false; }
  supportsBatch(): boolean { return false; }
  supportsStreaming(): boolean { return false; }
  
  async getNetworkStatus(): Promise<any> { return { blockHeight: 1000 }; }
}
