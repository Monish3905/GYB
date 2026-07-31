export interface WatchlistProvider {
  name: string;
  check(name: string, country: string): Promise<SanctionsResult>;
}

export interface SanctionsResult {
  status: 'CLEAR' | 'MATCH' | 'PARTIAL_MATCH' | 'REVIEW' | 'BLOCK';
  matchScore: number;
  confidence: number;
  matchedEntity?: string;
  reason?: string;
}
