import { IDatabase } from '@payment-os/database';
import { IUnitOfWork } from '@payment-os/unit-of-work';
import { DomainEvent } from '@payment-os/events';

export class OutboxRelay {
  constructor(private db: IDatabase) {}

  public async saveEvent(event: DomainEvent, uow: IUnitOfWork): Promise<void> {
    const conn = uow.getConnection();
    
    // Write event into the same transaction as business data
    const sql = `
      INSERT INTO Outbox (
        event_id, event_type, payload, status, created_at
      ) VALUES ($1, $2, $3, 'PENDING', $4)
    `;
    const params = [
      event.eventId,
      event.eventType,
      JSON.stringify(event),
      new Date()
    ];

    await conn.execute(sql, params);
  }

  // A background worker would poll this or use logical decoding
  public async fetchPendingEvents(limit: number = 100): Promise<any[]> {
    const sql = `
      SELECT * FROM Outbox 
      WHERE status = 'PENDING' 
      ORDER BY created_at ASC 
      LIMIT $1
    `;
    return await this.db.query(sql, [limit]);
  }

  public async markProcessed(eventIds: string[]): Promise<void> {
    if (eventIds.length === 0) return;
    
    // Note: Use ANY($1) syntax for pg arrays
    const sql = `
      UPDATE Outbox 
      SET status = 'PROCESSED', processed_at = CURRENT_TIMESTAMP
      WHERE event_id = ANY($1)
    `;
    await this.db.execute(sql, [eventIds]);
  }
}
