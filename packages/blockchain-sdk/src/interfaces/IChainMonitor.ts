export interface IChainMonitor {
  /** Track a pending transaction */
  trackPendingTransaction(txHash: string): Promise<void>;
  
  /** Get the current number of confirmations for a transaction */
  getConfirmations(txHash: string): Promise<number>;
  
  /** Detect if a transaction has failed on-chain */
  detectFailures(txHash: string): Promise<boolean>;
  
  /** Detect if a transaction was dropped from the mempool */
  detectDroppedTransaction(txHash: string): Promise<boolean>;
  
  /** Detect if a chain reorganization affected a transaction */
  detectReorganization(txHash: string): Promise<boolean>;
  
  /** Subscribe to settlement events */
  onSettlementEvent(callback: (event: any) => void): void;
}
