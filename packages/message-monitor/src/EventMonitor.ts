export class EventMonitor {
  private metrics = {
    messagesPublished: 0,
    messagesConsumed: 0,
    dlqCount: 0,
    retryCount: 0,
    publishLatencies: [] as number[],
    consumeLatencies: [] as number[]
  };

  public recordPublish(latencyMs: number): void {
    this.metrics.messagesPublished++;
    this.metrics.publishLatencies.push(latencyMs);
  }

  public recordConsume(latencyMs: number): void {
    this.metrics.messagesConsumed++;
    this.metrics.consumeLatencies.push(latencyMs);
  }

  public recordRetry(): void {
    this.metrics.retryCount++;
  }

  public recordDLQ(): void {
    this.metrics.dlqCount++;
  }

  public getMetrics(): any {
    return { ...this.metrics };
  }
}
