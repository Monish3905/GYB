export class RetryEngine {
  constructor(private maxRetries: number = 3, private baseBackoffMs: number = 100) {}

  public async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;
    
    while (true) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        
        // Poison message detection logic could go here based on error type
        if (error.name === 'PoisonMessageError') {
          throw error; // Fail immediately
        }

        if (attempt > this.maxRetries) {
          throw new Error(`Max retries (${this.maxRetries}) exceeded: ${error.message}`);
        }

        const backoff = this.baseBackoffMs * Math.pow(2, attempt - 1);
        // Add jitter
        const jitter = Math.random() * 50;
        await new Promise(resolve => setTimeout(resolve, backoff + jitter));
      }
    }
  }
}
