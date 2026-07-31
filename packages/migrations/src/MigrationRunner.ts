import { IDatabase } from '@payment-os/database';
import * as fs from 'fs';
import * as path from 'path';

export interface MigrationRecord {
  id: number;
  name: string;
  checksum: string;
  executedAt: Date;
}

export class MigrationRunner {
  constructor(private db: IDatabase, private migrationsDir: string) {}

  public async initialize(): Promise<void> {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public async runMigrations(): Promise<void> {
    await this.initialize();
    
    const files = fs.readdirSync(this.migrationsDir).filter(f => f.endsWith('.sql')).sort();
    
    for (const file of files) {
      const filePath = path.join(this.migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const checksum = this.calculateChecksum(sql); // basic checksum for mock

      const executed = await this.db.query<MigrationRecord>(
        'SELECT * FROM schema_migrations WHERE name = $1',
        [file]
      );

      if (executed.length > 0) {
        if (executed[0].checksum !== checksum) {
          throw new Error(`Checksum mismatch for migration ${file}`);
        }
        continue;
      }

      console.log(`Running migration: ${file}`);
      const conn = await this.db.getConnection();
      try {
        await conn.execute('BEGIN');
        await conn.execute(sql);
        await conn.execute(
          'INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
          [file, checksum]
        );
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }
  }

  private calculateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit int
    }
    return hash.toString();
  }
}
