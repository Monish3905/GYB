import { IConnection, IDatabase } from '@payment-os/database';

export interface IUnitOfWork {
  getConnection(): IConnection;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class UnitOfWork implements IUnitOfWork {
  private activeConnection: IConnection | null = null;
  private isCompleted: boolean = false;

  constructor(private db: IDatabase, private isolationLevel: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE' = 'SERIALIZABLE') {}

  public async start(): Promise<void> {
    if (this.activeConnection) {
      throw new Error("UnitOfWork already started.");
    }
    this.activeConnection = await this.db.getConnection();
    await this.activeConnection.execute(`BEGIN ISOLATION LEVEL ${this.isolationLevel}`);
  }

  public getConnection(): IConnection {
    if (!this.activeConnection || this.isCompleted) {
      throw new Error("UnitOfWork is not active.");
    }
    return this.activeConnection;
  }

  public async commit(): Promise<void> {
    if (!this.activeConnection || this.isCompleted) return;
    try {
      await this.activeConnection.commit();
    } finally {
      this.activeConnection.release();
      this.isCompleted = true;
    }
  }

  public async rollback(): Promise<void> {
    if (!this.activeConnection || this.isCompleted) return;
    try {
      await this.activeConnection.rollback();
    } finally {
      this.activeConnection.release();
      this.isCompleted = true;
    }
  }
}
