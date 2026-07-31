import { IDatabase } from '@payment-os/database';

export interface SnapshotRecord {
  aggregateId: string;
  version: number;
  data: any;
  timestamp: Date;
}

export class SnapshotStore {
  constructor(private db: IDatabase) {}

  public async createSnapshot(aggregateId: string, version: number, data: any): Promise<void> {
    const sql = `
      INSERT INTO Snapshots (
        aggregate_id, version, data, timestamp
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (aggregate_id) 
      DO UPDATE SET version = EXCLUDED.version, data = EXCLUDED.data, timestamp = EXCLUDED.timestamp
    `;
    await this.db.execute(sql, [aggregateId, version, JSON.stringify(data), new Date()]);
  }

  public async loadSnapshot(aggregateId: string): Promise<SnapshotRecord | null> {
    const sql = `SELECT * FROM Snapshots WHERE aggregate_id = $1`;
    const rows = await this.db.query(sql, [aggregateId]);
    if (rows.length === 0) return null;
    return {
      aggregateId: rows[0].aggregate_id,
      version: rows[0].version,
      data: JSON.parse(rows[0].data),
      timestamp: rows[0].timestamp
    };
  }

  public async deleteSnapshot(aggregateId: string): Promise<void> {
    const sql = `DELETE FROM Snapshots WHERE aggregate_id = $1`;
    await this.db.execute(sql, [aggregateId]);
  }
}
