export type ExposureDimension = 'Country' | 'Currency' | 'Corridor' | 'Provider' | 'Blockchain' | 'TreasuryPool' | 'Merchant' | 'Customer' | 'Institution';

export interface ExposureLimit {
  limitId: string;
  dimension: ExposureDimension;
  entityId: string; // e.g., 'USD', 'US-MX', 'ProviderA'
  current: number;
  projected: number;
  reserved: number;
  maximum: number;
  emergency: number;
  currency: string; // Base currency for this limit (e.g., USD)
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  availableCapacity: number;
}
