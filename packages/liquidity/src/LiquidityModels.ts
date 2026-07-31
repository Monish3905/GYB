export type PoolLevel = 'global' | 'regional' | 'country' | 'city' | 'partner' | 'blockchain' | 'merchant' | 'reserve' | 'emergency';

export interface LiquidityPool {
  id: string;
  level: PoolLevel;
  countryCode?: string;
  currency: string;
  
  available: number;
  reserved: number;
  committed: number;
  locked: number;
  
  parentPoolId?: string; // For the graph traversal (e.g. Country -> Regional -> Global)
}

export type ReservationState = 'reserved' | 'committed' | 'released' | 'expired' | 'rolled_back';

export interface LiquidityReservation {
  reservationId: string;
  transactionId: string;
  poolId: string;
  currency: string;
  amount: number;
  state: ReservationState;
  timestamp: Date;
  expiration: Date;
  reason: string;
  correlationId?: string;
}

export type LiquidityPolicy = 'lowest_cost' | 'highest_availability' | 'emergency_mode' | 'maximum_reserve';
