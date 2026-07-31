export interface IQueryOptions {
  transaction?: IConnection;
  timeoutMs?: number;
}

export interface IConnection {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<number>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

export interface IDatabase {
  query<T = any>(sql: string, params?: any[], options?: IQueryOptions): Promise<T[]>;
  execute(sql: string, params?: any[], options?: IQueryOptions): Promise<number>;
  
  getConnection(): Promise<IConnection>;
  
  healthCheck(): Promise<boolean>;
}
