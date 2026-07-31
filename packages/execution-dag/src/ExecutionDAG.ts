export type DAGNodeStatus = 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

export interface DAGNode {
  nodeId: string;
  name: string;
  dependencies: string[]; // nodeIds that must complete before this starts
  status: DAGNodeStatus;
  
  // Saga pattern
  forwardAction: (context: any) => Promise<void>;
  compensationAction: (context: any) => Promise<void>;
}

export class ExecutionDAG {
  private nodes: Map<string, DAGNode> = new Map();
  private context: any = {};

  constructor(public executionId: string) {}

  public addNode(node: DAGNode): void {
    this.nodes.set(node.nodeId, node);
  }

  public getNode(nodeId: string): DAGNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getNodes(): DAGNode[] {
    return Array.from(this.nodes.values());
  }

  public getReadyNodes(): DAGNode[] {
    return this.getNodes().filter(node => 
      node.status === 'PENDING' && 
      node.dependencies.every(depId => this.nodes.get(depId)?.status === 'COMPLETED')
    );
  }

  public getCompletedNodes(): DAGNode[] {
    return this.getNodes().filter(node => node.status === 'COMPLETED');
  }

  public markExecuting(nodeId: string): void {
    const node = this.getNode(nodeId);
    if (node) node.status = 'EXECUTING';
  }

  public markCompleted(nodeId: string): void {
    const node = this.getNode(nodeId);
    if (node) node.status = 'COMPLETED';
  }

  public markFailed(nodeId: string): void {
    const node = this.getNode(nodeId);
    if (node) node.status = 'FAILED';
  }

  public markRolledBack(nodeId: string): void {
    const node = this.getNode(nodeId);
    if (node) node.status = 'ROLLED_BACK';
  }

  public isComplete(): boolean {
    return this.getNodes().every(n => n.status === 'COMPLETED');
  }

  public hasFailures(): boolean {
    return this.getNodes().some(n => n.status === 'FAILED');
  }
}
