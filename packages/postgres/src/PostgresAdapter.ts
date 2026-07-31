import { Pool, PoolClient } from 'pg';
import { IDatabase, IConnection, IQueryOptions } from '@payment-os/database';

export class PostgresConnection implements IConnection {
  constructor(private client: PoolClient) {}

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const result = await this.client.query(sql, params);
    return result.rows;
  }

  public async execute(sql: string, params: any[] = []): Promise<number> {
    const result = await this.client.query(sql, params);
    return result.rowCount ?? 0;
  }

  public async commit(): Promise<void> {
    await this.client.query('COMMIT');
  }

  public async rollback(): Promise<void> {
    await this.client.query('ROLLBACK');
  }

  public release(): void {
    this.client.release();
  }
}

export class PostgresAdapter implements IDatabase {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public async query<T = any>(sql: string, params: any[] = [], options?: IQueryOptions): Promise<T[]> {
    if (options?.transaction) {
      return options.transaction.query<T>(sql, params);
    }
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  public async execute(sql: string, params: any[] = [], options?: IQueryOptions): Promise<number> {
    if (options?.transaction) {
      return options.transaction.execute(sql, params);
    }
    const result = await this.pool.query(sql, params);
    return result.rowCount ?? 0;
  }

  public async getConnection(): Promise<IConnection> {
    const client = await this.pool.connect();
    return new PostgresConnection(client);
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
