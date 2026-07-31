export class DatabaseMonitor {
  private metrics = {
    activeConnections: 0,
    totalTransactions: 0,
    rolledBackTransactions: 0,
    queryLatencies: [] as number[],
    deadlocks: 0
  };

  public recordConnection(): void {
    this.metrics.activeConnections++;
  }

  public releaseConnection(): void {
    this.metrics.activeConnections--;
  }

  public recordTransactionCommit(): void {
    this.metrics.totalTransactions++;
  }

  public recordTransactionRollback(): void {
    this.metrics.totalTransactions++;
    this.metrics.rolledBackTransactions++;
  }

  public recordQueryLatency(ms: number): void {
    this.metrics.queryLatencies.push(ms);
    if (this.metrics.queryLatencies.length > 1000) {
      this.metrics.queryLatencies.shift();
    }
  }

  public getMetrics(): any {
    return { ...this.metrics };
  }
}
