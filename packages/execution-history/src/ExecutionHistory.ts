import { ExecutionPlan } from '@payment-os/execution-engine';

export interface ExecutionRecord {
  executionId: string;
  plan: ExecutionPlan;
  status: string;
  startTime: Date;
  endTime?: Date;
  events: any[]; // Timeline of execution events
}

export class ExecutionHistory {
  private records: Map<string, ExecutionRecord> = new Map();

  public initializeRecord(plan: ExecutionPlan): void {
    this.records.set(plan.executionId, {
      executionId: plan.executionId,
      plan,
      status: plan.status,
      startTime: new Date(),
      events: []
    });
  }

  public updateStatus(executionId: string, status: string): void {
    const record = this.records.get(executionId);
    if (record) {
      record.status = status;
      if (['COMPLETED', 'FAILED', 'ROLLED_BACK'].includes(status)) {
        record.endTime = new Date();
      }
    }
  }

  public appendEvent(executionId: string, event: any): void {
    const record = this.records.get(executionId);
    if (record) {
      record.events.push(event);
    }
  }

  public getRecord(executionId: string): ExecutionRecord | undefined {
    return this.records.get(executionId);
  }
}
