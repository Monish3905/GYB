import { WatchlistProvider, SanctionsResult } from '@payment-os/watchlists';

export class SanctionsEngine {
  private providers: WatchlistProvider[] = [];

  public registerProvider(provider: WatchlistProvider): void {
    this.providers.push(provider);
  }

  public async evaluate(name: string, country: string): Promise<SanctionsResult> {
    for (const provider of this.providers) {
      const result = await provider.check(name, country);
      if (result.status === 'BLOCK' || result.status === 'MATCH') {
        return result; // Fast fail
      }
    }
    return { status: 'CLEAR', matchScore: 0, confidence: 100 };
  }
}
