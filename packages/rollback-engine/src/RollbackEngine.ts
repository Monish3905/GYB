import { IEventBus } from '@payment-os/events';
import { DAGNode } from '@payment-os/execution-dag';

export class RollbackEngine {
  constructor(private eventBus: IEventBus) {}

  public async rollbackNodes(executionId: string, completedNodes: DAGNode[]): Promise<void> {
    // Reverse order for rollback
    const nodesToRollback = [...completedNodes].reverse();

    for (const node of nodesToRollback) {
      try {
        await node.compensationAction({ executionId, nodeId: node.nodeId });
        
        await this.eventBus.publish({
          eventId: crypto.randomUUID(),
          timestamp: new Date(),
          eventType: 'ExecutionRolledBack',
          executionId,
          nodeId: node.nodeId
        } as any);

      } catch (error) {
        console.error(`Failed to rollback node ${node.nodeId} for execution ${executionId}`, error);
        // This is a critical failure - could trigger manual intervention or DLQ
      }
    }
  }
}
