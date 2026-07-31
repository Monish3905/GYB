export interface OnlineFeatureStore {
  getFeatures(entityId: string, featureNames: string[]): Promise<Record<string, any>>;
  setFeatures(entityId: string, features: Record<string, any>): Promise<void>;
}

export interface OfflineFeatureStore {
  getHistoricalFeatures(entityId: string, featureNames: string[], fromDate: Date, toDate: Date): Promise<Record<string, any>[]>;
}

export class FeatureStoreManager {
  constructor(
    private onlineStore: OnlineFeatureStore,
    private offlineStore: OfflineFeatureStore
  ) {}

  public async getTransactionFeatures(customerId: string): Promise<Record<string, any>> {
    // In a real system, this fetches 30 day volume, velocity, account age from Redis
    const features = await this.onlineStore.getFeatures(customerId, [
      '30_day_volume',
      '7_day_volume',
      'device_count',
      'wallet_count',
      'country_diversity',
      'velocity',
      'average_amount',
      'beneficiary_diversity',
      'account_age'
    ]);

    // Fill defaults for missing features
    return {
      '30_day_volume': features['30_day_volume'] ?? 0,
      '7_day_volume': features['7_day_volume'] ?? 0,
      'device_count': features['device_count'] ?? 1,
      'wallet_count': features['wallet_count'] ?? 0,
      'country_diversity': features['country_diversity'] ?? 1,
      'velocity': features['velocity'] ?? 0,
      'average_amount': features['average_amount'] ?? 0,
      'beneficiary_diversity': features['beneficiary_diversity'] ?? 1,
      'account_age': features['account_age'] ?? 1,
    };
  }
}
