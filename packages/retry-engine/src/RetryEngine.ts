export type RetryStrategy = 'IMMEDIATE' | 'LINEAR' | 'EXPONENTIAL_BACKOFF' | 'FAILOVER';

export interface RetryPolicy {
  strategy: RetryStrategy;
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor?: number;
}

export class RetryEngine {
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    policy: RetryPolicy,
    onRetry?: (attempt: number, delay: number, error: any) => Promise<void>
  ): Promise<T> {
    let attempts = 0;
    let delay = policy.initialDelayMs;

    while (true) {
      attempts++;
      try {
        return await operation();
      } catch (error) {
        if (attempts >= policy.maxAttempts) {
          throw error; // Maximum attempts reached, bubble up error
        }

        if (onRetry) {
          await onRetry(attempts, delay, error);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Calculate next delay based on strategy
        if (policy.strategy === 'LINEAR') {
          delay = Math.min(delay + policy.initialDelayMs, policy.maxDelayMs);
        } else if (policy.strategy === 'EXPONENTIAL_BACKOFF') {
          delay = Math.min(delay * (policy.backoffFactor || 2), policy.maxDelayMs);
        }
      }
    }
  }
}
