export interface BlockchainAnalyticsResult {
  walletAddress: string;
  chain: string;
  riskScore: number;
  flags: string[];
  mixerExposure: number;
  darknetsExposure: number;
  sanctionedExposure: number;
}

export interface IBlockchainAnalyticsProvider {
  analyzeWallet(address: string, chain: string): Promise<BlockchainAnalyticsResult>;
}

export class BlockchainAnalyzer {
  private providers: IBlockchainAnalyticsProvider[] = [];

  public registerProvider(provider: IBlockchainAnalyticsProvider): void {
    this.providers.push(provider);
  }

  public async analyze(address: string, chain: string): Promise<BlockchainAnalyticsResult> {
    if (this.providers.length === 0) {
      // Default passthrough with zero risk
      return {
        walletAddress: address,
        chain,
        riskScore: 0,
        flags: [],
        mixerExposure: 0,
        darknetsExposure: 0,
        sanctionedExposure: 0
      };
    }
    // Aggregate across providers - use highest risk
    const results = await Promise.all(this.providers.map(p => p.analyzeWallet(address, chain)));
    return results.reduce((highest, cur) => cur.riskScore > highest.riskScore ? cur : highest);
  }
}
