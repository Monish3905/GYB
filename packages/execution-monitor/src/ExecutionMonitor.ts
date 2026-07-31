export interface ExecutionMetrics {
  executionCount: number;
  successCount: number;
  failureCount: number;
  retryCount: number;
  rollbackCount: number;
  
  // Latency metrics in ms
  latencies: number[];
  
  treasuryUsage: number;
  liquidityUsage: number;
  gasUsed: number;
  settlementCost: number;
  fxUsed: number;

  activeExecutions: number;
}

export class ExecutionMonitor {
  private metrics: ExecutionMetrics;

  constructor() {
    this.metrics = {
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      retryCount: 0,
      rollbackCount: 0,
      latencies: [],
      treasuryUsage: 0,
      liquidityUsage: 0,
      gasUsed: 0,
      settlementCost: 0,
      fxUsed: 0,
      activeExecutions: 0
    };
  }

  public recordStart(): void {
    this.metrics.executionCount++;
    this.metrics.activeExecutions++;
  }

  public recordSuccess(latencyMs: number): void {
    this.metrics.successCount++;
    this.metrics.activeExecutions--;
    this.metrics.latencies.push(latencyMs);
  }

  public recordFailure(): void {
    this.metrics.failureCount++;
    this.metrics.activeExecutions--;
  }

  public recordRetry(): void {
    this.metrics.retryCount++;
  }

  public recordRollback(): void {
    this.metrics.rollbackCount++;
  }

  public getMetrics(): any {
    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    const avg = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;

    return {
      executionCount: this.metrics.executionCount,
      successRate: this.metrics.executionCount ? this.metrics.successCount / this.metrics.executionCount : 0,
      failureRate: this.metrics.executionCount ? this.metrics.failureCount / this.metrics.executionCount : 0,
      retryRate: this.metrics.executionCount ? this.metrics.retryCount / this.metrics.executionCount : 0,
      rollbackRate: this.metrics.executionCount ? this.metrics.rollbackCount / this.metrics.executionCount : 0,
      p50,
      p95,
      p99,
      averageLatency: avg,
      activeExecutions: this.metrics.activeExecutions
    };
  }
}
