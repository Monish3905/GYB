import { ILockManager, LockDetails } from './ILockManager';

export class InMemoryLockManager implements ILockManager {
  private locks: Map<string, LockDetails> = new Map();

  private getMapKey(resourceType: string, resourceId: string): string {
    return `${resourceType}::${resourceId}`;
  }

  public async acquireLock(
    resourceType: string,
    resourceId: string,
    ownerId: string,
    ttlMs: number = 30000
  ): Promise<LockDetails | null> {
    const key = this.getMapKey(resourceType, resourceId);
    const existingLock = this.locks.get(key);
    const now = new Date();

    if (existingLock) {
      if (existingLock.expiresAt > now && existingLock.ownerId !== ownerId) {
        // Locked by someone else and hasn't expired
        return null;
      }
      // Re-entrant lock or expired lock
    }

    const lockId = crypto.randomUUID();
    const lock: LockDetails = {
      lockId,
      resourceId,
      resourceType: resourceType as any,
      ownerId,
      expiresAt: new Date(now.getTime() + ttlMs)
    };

    this.locks.set(key, lock);
    return lock;
  }

  public async releaseLock(lockId: string): Promise<boolean> {
    for (const [key, lock] of this.locks.entries()) {
      if (lock.lockId === lockId) {
        this.locks.delete(key);
        return true;
      }
    }
    return false;
  }

  public async getLock(resourceType: string, resourceId: string): Promise<LockDetails | null> {
    const key = this.getMapKey(resourceType, resourceId);
    const lock = this.locks.get(key);
    
    if (lock && lock.expiresAt < new Date()) {
      this.locks.delete(key); // Lazy expiration
      return null;
    }
    
    return lock || null;
  }
}
