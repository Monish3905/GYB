import { ExecutionStatus } from '@payment-os/execution-engine';

export class ExecutionStateMachine {
  private allowedTransitions: Record<ExecutionStatus, ExecutionStatus[]> = {
    'CREATED': ['VALIDATED', 'FAILED'],
    'VALIDATED': ['RESOURCES_RESERVED', 'FAILED'],
    'RESOURCES_RESERVED': ['EXECUTION_PLANNED', 'ROLLED_BACK', 'FAILED'],
    'EXECUTION_PLANNED': ['EXECUTING', 'ROLLED_BACK', 'FAILED'],
    'EXECUTING': ['PENDING_CONFIRMATION', 'FAILED', 'ROLLED_BACK'],
    'PENDING_CONFIRMATION': ['CONFIRMED', 'FAILED', 'TIMEOUT'],
    'CONFIRMED': ['FINALIZED', 'FAILED'],
    'FINALIZED': ['LEDGER_COMMIT_REQUESTED'],
    'LEDGER_COMMIT_REQUESTED': ['TREASURY_COMMITTED', 'FAILED'],
    'TREASURY_COMMITTED': ['COMPLETED'],
    'COMPLETED': ['ARCHIVED'],
    'ARCHIVED': [],
    'FAILED': ['ROLLED_BACK', 'ARCHIVED'],
    'ROLLED_BACK': ['ARCHIVED'],
    'TIMEOUT': ['FAILED', 'ROLLED_BACK']
  } as any;

  public canTransition(current: ExecutionStatus, next: ExecutionStatus): boolean {
    const transitions = this.allowedTransitions[current];
    return transitions ? transitions.includes(next) : false;
  }
}
