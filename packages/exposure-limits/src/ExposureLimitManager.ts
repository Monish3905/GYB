import { ExposureLimit, ExposureDimension, LimitCheckResult } from './ExposureLimit';
import { IEventBus } from '@payment-os/events';

export class ExposureLimitManager {
  // In-memory limit store
  private limits: Map<string, ExposureLimit> = new Map();

  constructor(private eventBus: IEventBus) {}

  public setLimit(limit: ExposureLimit): void {
    const key = this.getLimitKey(limit.dimension, limit.entityId);
    this.limits.set(key, limit);
  }

  public getLimit(dimension: ExposureDimension, entityId: string): ExposureLimit | undefined {
    return this.limits.get(this.getLimitKey(dimension, entityId));
  }

  public checkCapacity(dimension: ExposureDimension, entityId: string, amount: number): LimitCheckResult {
    const limit = this.getLimit(dimension, entityId);
    if (!limit) {
      // If no limit exists, we consider it allowed (or we could enforce strict mode)
      return { allowed: true, availableCapacity: Number.MAX_SAFE_INTEGER };
    }

    const totalExposure = limit.current + limit.projected + limit.reserved + amount;
    
    if (totalExposure > limit.maximum) {
      if (totalExposure <= limit.emergency) {
        // Exceeds max but within emergency limit. We could flag it or allow it based on policy.
        // For standard checking, we say not allowed unless it's an emergency settlement.
        return { 
          allowed: false, 
          reason: `Exceeds maximum limit of ${limit.maximum}. Within emergency limit.`, 
          availableCapacity: limit.maximum - (limit.current + limit.projected + limit.reserved)
        };
      } else {
        return { 
          allowed: false, 
          reason: `Exceeds emergency limit of ${limit.emergency}.`, 
          availableCapacity: 0
        };
      }
    }

    return { 
      allowed: true, 
      availableCapacity: limit.maximum - (limit.current + limit.projected + limit.reserved)
    };
  }

  public async reserveCapacity(dimension: ExposureDimension, entityId: string, amount: number): Promise<boolean> {
    const check = this.checkCapacity(dimension, entityId, amount);
    if (!check.allowed) {
      await this.publishLimitExceededEvent(dimension, entityId, amount);
      return false;
    }

    const limit = this.getLimit(dimension, entityId);
    if (limit) {
      limit.reserved += amount;
      await this.publishExposureUpdatedEvent(limit);
    }
    return true;
  }

  public async confirmCapacity(dimension: ExposureDimension, entityId: string, amount: number): Promise<void> {
    const limit = this.getLimit(dimension, entityId);
    if (limit) {
      limit.reserved -= amount;
      limit.current += amount;
      await this.publishExposureUpdatedEvent(limit);
    }
  }

  public async releaseCapacity(dimension: ExposureDimension, entityId: string, amount: number): Promise<void> {
    const limit = this.getLimit(dimension, entityId);
    if (limit) {
      limit.reserved -= amount;
      await this.publishExposureUpdatedEvent(limit);
    }
  }

  private getLimitKey(dimension: ExposureDimension, entityId: string): string {
    return `${dimension}:${entityId}`;
  }

  private async publishLimitExceededEvent(dimension: ExposureDimension, entityId: string, amount: number): Promise<void> {
    // We would publish to EventBus here
    // eventType: 'ExposureLimitExceeded'
    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'ExposureLimitExceeded',
      entityId,
      dimension,
      limitType: 'MAXIMUM',
      excessAmount: amount
    } as any);
  }

  private async publishExposureUpdatedEvent(limit: ExposureLimit): Promise<void> {
    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'ExposureUpdated',
      entityId: limit.entityId,
      dimension: limit.dimension,
      currentExposure: limit.current,
      projectedExposure: limit.projected
    } as any);
  }
}
