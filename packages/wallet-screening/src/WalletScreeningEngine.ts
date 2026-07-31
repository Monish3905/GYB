import { BlockchainAnalyzer, BlockchainAnalyticsResult } from '@payment-os/blockchain-analytics';

export type SupportedChain = 'SOLANA' | 'ETHEREUM' | 'POLYGON' | 'BASE' | 'ARBITRUM' | 'OPTIMISM' | 'AVALANCHE';

export interface WalletScreeningResult {
  walletAddress: string;
  chain: SupportedChain;
  screeningId: string;
  riskScore: number;
  passed: boolean;
  flags: string[];
  screenedAt: Date;
}

export class WalletScreeningEngine {
  constructor(private analyzer: BlockchainAnalyzer) {}

  public async screenWallet(address: string, chain: SupportedChain): Promise<WalletScreeningResult> {
    const analyticsResult: BlockchainAnalyticsResult = await this.analyzer.analyze(address, chain);
    
    const passed = analyticsResult.riskScore < 70
      && analyticsResult.mixerExposure < 10
      && analyticsResult.darknetsExposure === 0
      && analyticsResult.sanctionedExposure === 0;

    return {
      walletAddress: address,
      chain,
      screeningId: crypto.randomUUID(),
      riskScore: analyticsResult.riskScore,
      passed,
      flags: analyticsResult.flags,
      screenedAt: new Date()
    };
  }
}
