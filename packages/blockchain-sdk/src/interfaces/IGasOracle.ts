export interface IGasOracle {
  /** Get current base fee */
  getCurrentFee(): Promise<string>;
  
  /** Get recommended priority fee */
  getPriorityFee(): Promise<string>;
  
  /** Get historical fee averages over a period */
  getHistoricalFee(period: string): Promise<string>;
  
  /** Predict fee for a specific time in the future */
  getPredictedFee(timeOffset: number): Promise<string>;
  
  /** Get network congestion level (0-100) */
  getCongestion(): Promise<number>;
  
  /** Get overall recommended fee combining base and priority */
  getRecommendedFee(): Promise<string>;
}
