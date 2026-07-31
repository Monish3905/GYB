export interface IChainProvider {
  /** Initialize connection to the blockchain */
  initialize(): Promise<void>;
  /** Check if the connection to the RPC node is healthy */
  health(): Promise<boolean>;
  /** Get provider capabilities */
  capabilities(): ProviderCapabilities;
  
  estimateFee(payload: any): Promise<any>;
  estimateConfirmationTime(payload: any): Promise<number>;
  
  createWallet(params: any): Promise<any>;
  importWallet(privateKey: string): Promise<any>;
  validateAddress(address: string): boolean;
  
  buildTransaction(params: any): Promise<any>;
  signTransaction(tx: any, signer: any): Promise<any>;
  broadcastTransaction(tx: any): Promise<string>;
  
  trackTransaction(txHash: string): Promise<void>;
  verifyTransaction(txHash: string): Promise<boolean>;
  cancelTransaction(txHash: string): Promise<boolean>;
  
  getBalance(address: string, asset?: string): Promise<string>;
  reserveLiquidity(params: any): Promise<any>;
  releaseLiquidity(params: any): Promise<any>;
  
  transfer(params: any): Promise<string>;
  rollback(params: any): Promise<boolean>;
  
  supportsAsset(asset: string): boolean;
  supportsBridge(): boolean;
  supportsSwap(): boolean;
  supportsBatch(): boolean;
  supportsStreaming(): boolean;
  
  getNetworkStatus(): Promise<any>;
}

export interface ProviderCapabilities {
  supportedAssets: string[];
  supportedChains: string[];
  supportedBridges: string[];
  supportedSwaps: string[];
  settlementSpeed: string;
  maximumTransactionSize: string;
  regions: string[];
  feeModel: string;
  liquidityAvailability: string;
  batchSupport: boolean;
  streamingSupport: boolean;
  nativeTokens: string[];
  stablecoins: string[];
}
