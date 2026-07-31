export interface ProviderCapabilities {
  supportedCountries: string[];
  supportedCurrencies: string[];
  supportedStablecoins: string[];
  settlementTypes: string[];
  averageLatencyMs: number;
  currentHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  maximumAmount: number;
  minimumAmount: number;
  successRate: number;
  priority: number;
  currentLiquidity: number;
  currentCapacity: number;
}

export interface IExecutionProvider {
  providerId: string;
  providerType: 'INTERNAL' | 'BLOCKCHAIN' | 'BANK' | 'BRIDGE' | 'SWAP' | 'CBDC';
  
  getCapabilities(): Promise<ProviderCapabilities>;
  
  // Idempotent execution step
  executeStep(context: any): Promise<{ success: boolean; referenceId: string; status: string }>;
  
  // Compensating action
  rollbackStep(referenceId: string): Promise<boolean>;
  
  // Status check for confirmation engine
  getStatus(referenceId: string): Promise<string>;
}
