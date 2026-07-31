import { IEventBus } from '@payment-os/events';
import { ExecutionStateMachine } from './ExecutionStateMachine';
import { ExecutionPlan, ExecutionStatus } from '@payment-os/execution-engine';
import { ProviderRouter } from '@payment-os/provider-router';
import { ConfirmationEngine } from '@payment-os/confirmation-engine';
import { RollbackEngine } from '@payment-os/rollback-engine';
import { RetryEngine } from '@payment-os/retry-engine';
import { DeadLetterQueue } from '@payment-os/dead-letter';
import { ExecutionMonitor } from '@payment-os/execution-monitor';
import { ExecutionHistory } from '@payment-os/execution-history';
import { ReconciliationGenerator } from '@payment-os/reconciliation';
import { ExecutionDAG } from '@payment-os/execution-dag';

export class SettlementOrchestrator {
  private stateMachine = new ExecutionStateMachine();

  constructor(
    private eventBus: IEventBus,
    private providerRouter: ProviderRouter,
    private confirmationEngine: ConfirmationEngine,
    private rollbackEngine: RollbackEngine,
    private retryEngine: RetryEngine,
    private deadLetterQueue: DeadLetterQueue,
    private executionMonitor: ExecutionMonitor,
    private history: ExecutionHistory,
    private reconciliation: ReconciliationGenerator
  ) {}

  public async orchestrate(plan: ExecutionPlan): Promise<void> {
    this.executionMonitor.recordStart();
    this.history.initializeRecord(plan);
    
    await this.transitionState(plan, 'CREATED');
    await this.transitionState(plan, 'VALIDATED');
    await this.transitionState(plan, 'RESOURCES_RESERVED');
    await this.transitionState(plan, 'EXECUTION_PLANNED');

    // Execute DAG
    await this.transitionState(plan, 'EXECUTING');
    const success = await this.executeDAG(plan.dag, plan);

    if (success) {
      this.executionMonitor.recordSuccess(0); // Add actual latency calculation
      await this.transitionState(plan, 'PENDING_CONFIRMATION');
      await this.transitionState(plan, 'CONFIRMED');
      await this.transitionState(plan, 'FINALIZED');
      await this.transitionState(plan, 'LEDGER_COMMIT_REQUESTED');
      await this.transitionState(plan, 'TREASURY_COMMITTED');
      await this.transitionState(plan, 'COMPLETED');
      
      // Generate Reconciliation
      this.reconciliation.generateExecutionRecord(plan.executionId, 'COMPLETED', plan);
      
    } else {
      this.executionMonitor.recordFailure();
      await this.transitionState(plan, 'FAILED');
      
      // Rollback logic
      await this.rollbackEngine.rollbackNodes(plan.executionId, plan.dag.getCompletedNodes());
      await this.transitionState(plan, 'ROLLED_BACK');
      
      // Dead Letter
      await this.deadLetterQueue.push({
        executionId: plan.executionId,
        settlementInstructionId: plan.settlementInstructionId,
        failureReason: 'DAG Execution Failed',
        retryCount: 0
      });
    }

    await this.transitionState(plan, 'ARCHIVED');
  }

  private async executeDAG(dag: ExecutionDAG, plan: ExecutionPlan): Promise<boolean> {
    // Basic single-threaded DAG runner for in-memory example
    while (!dag.isComplete() && !dag.hasFailures()) {
      const readyNodes = dag.getReadyNodes();
      
      if (readyNodes.length === 0) {
        break; // Deadlock or finished
      }

      for (const node of readyNodes) {
        dag.markExecuting(node.nodeId);
        await this.eventBus.publish({
          eventId: crypto.randomUUID(),
          timestamp: new Date(),
          eventType: 'ExecutionNodeStarted',
          executionId: plan.executionId,
          nodeId: node.nodeId
        } as any);

        try {
          await this.retryEngine.executeWithRetry(
            () => node.forwardAction(plan),
            plan.retryPolicy || { strategy: 'IMMEDIATE', maxAttempts: 1, initialDelayMs: 0, maxDelayMs: 0 }
          );

          dag.markCompleted(node.nodeId);
          await this.eventBus.publish({
            eventId: crypto.randomUUID(),
            timestamp: new Date(),
            eventType: 'ExecutionNodeCompleted',
            executionId: plan.executionId,
            nodeId: node.nodeId
          } as any);
        } catch (error) {
          dag.markFailed(node.nodeId);
          return false;
        }
      }
    }
    
    return dag.isComplete();
  }

  private async transitionState(plan: ExecutionPlan, nextState: ExecutionStatus): Promise<void> {
    if (this.stateMachine.canTransition(plan.status, nextState)) {
      plan.status = nextState;
      this.history.updateStatus(plan.executionId, nextState);
      
      // Maps generic transitions to specific events could be done here
    } else {
      throw new Error(`Invalid state transition from ${plan.status} to ${nextState}`);
    }
  }
}
