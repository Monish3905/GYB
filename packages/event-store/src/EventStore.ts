import { IDatabase } from '@payment-os/database';
import { IUnitOfWork } from '@payment-os/unit-of-work';
import { DomainEvent } from '@payment-os/events';

export class EventStore {
  constructor(private db: IDatabase) {}

  public async appendEvent(event: DomainEvent, uow?: IUnitOfWork): Promise<void> {
    const conn = uow ? uow.getConnection() : this.db;
    
    const sql = `
      INSERT INTO Events (
        event_id, event_type, aggregate_id, data, timestamp
      ) VALUES ($1, $2, $3, $4, $5)
    `;
    const params = [
      event.eventId,
      event.eventType,
      (event as any).executionId || (event as any).journalId || 'GLOBAL', // Aggregate inference
      JSON.stringify(event),
      event.timestamp
    ];

    await conn.execute(sql, params);
  }

  public async replayByAggregate(aggregateId: string): Promise<DomainEvent[]> {
    const sql = `
      SELECT data FROM Events
      WHERE aggregate_id = $1
      ORDER BY timestamp ASC, id ASC
    `;
    const rows = await this.db.query(sql, [aggregateId]);
    return rows.map(r => JSON.parse(r.data));
  }
}
