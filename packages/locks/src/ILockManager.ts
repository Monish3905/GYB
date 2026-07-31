export interface LockDetails {
  lockId: string;
  resourceId: string;
  resourceType: 'SETTLEMENT' | 'TREASURY' | 'PROVIDER' | 'LIQUIDITY';
  ownerId: string; // The execution or process holding the lock
  expiresAt: Date;
}

export interface ILockManager {
  acquireLock(resourceType: string, resourceId: string, ownerId: string, ttlMs?: number): Promise<LockDetails | null>;
  releaseLock(lockId: string): Promise<boolean>;
  getLock(resourceType: string, resourceId: string): Promise<LockDetails | null>;
}
