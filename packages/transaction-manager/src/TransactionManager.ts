import { IDatabase } from '@payment-os/database';
import { UnitOfWork, IUnitOfWork } from '@payment-os/unit-of-work';

export class TransactionManager {
  constructor(private db: IDatabase) {}

  public async runInTransaction<T>(
    operation: (uow: IUnitOfWork) => Promise<T>,
    isolationLevel: 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE' = 'SERIALIZABLE'
  ): Promise<T> {
    const uow = new UnitOfWork(this.db, isolationLevel);
    
    await uow.start();
    
    try {
      const result = await operation(uow);
      await uow.commit();
      return result;
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}
