import { IDatabase } from '@payment-os/database';

export class DatabaseHealthCheck {
  constructor(private db: IDatabase) {}

  public async checkHealth(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      const isUp = await this.db.healthCheck();
      const latencyMs = Date.now() - start;
      if (isUp) {
        return { healthy: true, latencyMs };
      }
      return { healthy: false, error: 'Health check query failed.' };
    } catch (e: any) {
      return { healthy: false, error: e.message };
    }
  }
}
