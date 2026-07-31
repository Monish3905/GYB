import { ReservationEngine } from '@payment-os/liquidity';

export type SettlementPriority = 'immediate' | 'delayed' | 'batch';

export interface SettlementTask {
  transactionId: string;
  reservationId: string;
  priority: SettlementPriority;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export class SettlementScheduler {
  private queue: SettlementTask[] = [];

  constructor(private reservationEngine: ReservationEngine) {}

  schedule(transactionId: string, reservationId: string, priority: SettlementPriority): void {
    this.queue.push({
      transactionId,
      reservationId,
      priority,
      status: 'queued'
    });
  }

  async executeNext(): Promise<void> {
    const immediateTasks = this.queue.filter(t => t.status === 'queued' && t.priority === 'immediate');
    if (immediateTasks.length === 0) return;

    const task = immediateTasks[0];
    task.status = 'processing';

    try {
      // Simulate settlement execution...
      // In a real system, we'd call the ISettlementProvider here
      await this.reservationEngine.commit(task.reservationId);
      task.status = 'completed';
    } catch (e) {
      task.status = 'failed';
      await this.reservationEngine.rollback(task.reservationId, 'Settlement execution failed');
    }
  }

  async processBatch(): Promise<void> {
    const batchTasks = this.queue.filter(t => t.status === 'queued' && t.priority === 'batch');
    for (const task of batchTasks) {
      task.status = 'processing';
      try {
        await this.reservationEngine.commit(task.reservationId);
        task.status = 'completed';
      } catch (e) {
        task.status = 'failed';
        await this.reservationEngine.rollback(task.reservationId, 'Batch execution failed');
      }
    }
  }
}
