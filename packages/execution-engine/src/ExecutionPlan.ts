import { ExecutionDAG } from '@payment-os/execution-dag';

export type ExecutionStatus = 'CREATED' | 'VALIDATED' | 'RESOURCES_RESERVED' | 'EXECUTION_PLANNED' | 'EXECUTING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'FINALIZED' | 'LEDGER_COMMIT_REQUESTED' | 'TREASURY_COMMITTED' | 'COMPLETED' | 'ARCHIVED' | 'FAILED' | 'ROLLED_BACK';

export interface ExecutionPlan {
  executionId: string;
  executionVersion: number;
  settlementInstructionId: string;
  correlationId: string;
  idempotencyKey: string;
  
  executionPolicy: string;
  priority: string;
  executionWindow: {
    start: Date;
    end: Date;
  };
  timeoutMs: number;
  
  retryPolicy: any;
  rollbackPolicy: any;
  
  providerSelection: string[];
  treasuryReservationId?: string;
  liquidityReservationId?: string;
  
  dag: ExecutionDAG;
  
  expectedCost: number;
  expectedLatencyMs: number;
  riskScore: number;
  
  status: ExecutionStatus;
}
