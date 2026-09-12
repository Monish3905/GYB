import CircuitBreaker from 'opossum';

export interface BreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
}

export class PlatformCircuitBreaker<I extends unknown[], O> {
  private breaker: CircuitBreaker<I, O>;

  constructor(action: (...args: I) => Promise<O>, options?: BreakerOptions) {
    const defaultOptions = {
      timeout: 3000, 
      errorThresholdPercentage: 50, 
      resetTimeout: 30000 
    };

    this.breaker = new CircuitBreaker(action, { ...defaultOptions, ...options });

    this.breaker.fallback(() => {
      throw new Error("Service unavailable - Circuit breaker is open");
    });
  }

  public async fire(...args: I): Promise<O> {
    return this.breaker.fire(...args);
  }
}
