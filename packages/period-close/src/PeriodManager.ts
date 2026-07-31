import { IEventBus } from '@payment-os/events';

export interface FinancialPeriod {
  periodId: string;
  startDate: Date;
  endDate: Date;
  status: 'OPEN' | 'CLOSED';
  closedAt?: Date;
  closedBy?: string;
}

export class PeriodManager {
  private periods: Map<string, FinancialPeriod> = new Map();

  constructor(private eventBus: IEventBus) {}

  public createPeriod(startDate: Date, endDate: Date): string {
    const periodId = crypto.randomUUID();
    this.periods.set(periodId, {
      periodId,
      startDate,
      endDate,
      status: 'OPEN'
    });
    return periodId;
  }

  public async closePeriod(periodId: string, closedBy: string): Promise<void> {
    const period = this.periods.get(periodId);
    if (!period) throw new Error("Period not found");
    if (period.status === 'CLOSED') throw new Error("Period already closed");

    period.status = 'CLOSED';
    period.closedAt = new Date();
    period.closedBy = closedBy;

    await this.eventBus.publish({
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: 'PeriodClosed',
      periodId
    } as any);
  }

  public isPeriodClosed(date: Date): boolean {
    for (const period of this.periods.values()) {
      if (date >= period.startDate && date <= period.endDate) {
        return period.status === 'CLOSED';
      }
    }
    return false; // If no explicitly closed period covers this date, assume open
  }
}
