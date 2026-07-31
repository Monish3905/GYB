export type NodeType = 'COUNTRY' | 'CURRENCY' | 'TREASURY_POOL' | 'BANK' | 'BLOCKCHAIN' | 'PROVIDER';

export interface GraphNode {
  id: string;
  type: NodeType;
  balance?: number;
  capacity?: number;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  cost: number;
  latencyMs: number;
  liquidityAvailable: number;
  riskScore: number;
  capacity: number;
}

export class SettlementGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge[]> = new Map();

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.edges.has(node.id)) {
      this.edges.set(node.id, []);
    }
  }

  public addEdge(edge: GraphEdge): void {
    const sourceEdges = this.edges.get(edge.sourceNodeId) || [];
    sourceEdges.push(edge);
    this.edges.set(edge.sourceNodeId, sourceEdges);
  }

  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getEdges(sourceNodeId?: string): GraphEdge[] {
    if (sourceNodeId) {
      return this.edges.get(sourceNodeId) || [];
    }
    return Array.from(this.edges.values()).flat();
  }

  // Future minimum-cost flow algorithm implementation point
  public findOptimalPath(sourceId: string, targetId: string, amount: number): GraphEdge[] {
    // Basic placeholder for graph routing
    return [];
  }
}
