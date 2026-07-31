import { ExecutionPlan } from '@payment-os/execution-engine';
import { IDatabase } from '@payment-os/database';
import { IUnitOfWork } from '@payment-os/unit-of-work';

export class SqlExecutionRepository {
  constructor(private db: IDatabase) {}

  public async getForUpdate(executionId: string, uow: IUnitOfWork): Promise<ExecutionPlan | null> {
    const conn = uow.getConnection();
    
    // Using Row Locking to prevent concurrent orchestration modifications
    const sql = `
      SELECT * FROM ExecutionPlans 
      WHERE execution_id = $1 
      FOR UPDATE NOWAIT
    `;
    const rows = await conn.query(sql, [executionId]);
    
    if (rows.length === 0) return null;
    
    const row = rows[0];
    // Simple deserialization map mock
    return {
      executionId: row.execution_id,
      status: row.status,
      // ... mapping other properties
    } as ExecutionPlan;
  }

  public async save(plan: ExecutionPlan, uow?: IUnitOfWork): Promise<void> {
    const conn = uow ? uow.getConnection() : this.db;
    
    const sql = `
      INSERT INTO ExecutionPlans (
        execution_id, status, settlement_instruction_id
      ) VALUES ($1, $2, $3)
      ON CONFLICT (execution_id) 
      DO UPDATE SET status = EXCLUDED.status
    `;
    const params = [
      plan.executionId,
      plan.status,
      plan.settlementInstructionId
    ];

    await conn.execute(sql, params);
  }
}
