import Redis from 'ioredis';
import Redlock from 'redlock';

export class DistributedLockManager {
  private redis: Redis;
  private redlock: Redlock;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    
    this.redlock = new Redlock([this.redis], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200, 
      retryJitter: 200,
      automaticExtensionThreshold: 500
    });
  }

  public async acquireLock(resource: string, ttl: number = 5000): Promise<any> {
    const lock = await this.redlock.acquire([`lock:${resource}`], ttl);
    return lock;
  }

  public async executeWithLock<T>(resource: string, action: () => Promise<T>, ttl: number = 5000): Promise<T> {
    const lock = await this.acquireLock(resource, ttl);
    try {
      return await action();
    } finally {
      await lock.release();
    }
  }
}
