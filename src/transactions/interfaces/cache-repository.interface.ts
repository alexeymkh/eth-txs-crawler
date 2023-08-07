import { IRepository } from './repository.interface';
import { ITransaction } from './transaction.interface';

export interface ICacheRepository extends IRepository {
  saveTransactions(txs: ITransaction[]): Promise<void>;
  getOldestBlockNumberOfCacheUpdatesRecords(address: string): Promise<number>;
  saveCacheUpdateRecord(
    address: string,
    startBlockNumber: number,
  ): Promise<void>;
}
