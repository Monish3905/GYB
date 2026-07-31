export interface IdempotencyRecord {
  key: string;
  status: 'STARTED' | 'COMPLETED' | 'FAILED';
  response?: any;
  ttl: number;
}

export class IdempotencyManager {
  private records: Map<string, IdempotencyRecord> = new Map();

  public async acquire(key: string): Promise<boolean> {
    const existing = this.records.get(key);
    if (existing) {
      if (existing.status === 'STARTED') {
        throw new Error('Concurrent request in progress for idempotency key');
      }
      return false; // Already executed
    }
    
    this.records.set(key, { key, status: 'STARTED', ttl: Date.now() + 86400000 });
    return true; // Acquired successfully
  }

  public async getResponse(key: string): Promise<any> {
    return this.records.get(key)?.response;
  }

  public async complete(key: string, response: any): Promise<void> {
    const record = this.records.get(key);
    if (record) {
      record.status = 'COMPLETED';
      record.response = response;
    }
  }

  public async fail(key: string): Promise<void> {
    const record = this.records.get(key);
    if (record) {
      record.status = 'FAILED';
    }
  }
}
