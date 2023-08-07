import { SortOrder } from '../transactions.types';
import { ITransaction } from './transaction.interface';

export interface IRepository {
  getTransactions(
    address: string,
    startBlock: number,
    page: number,
    offset: number,
    sort: SortOrder,
  ): Promise<ITransaction[]>;

  getLastTxBlockNumber(address: string): Promise<number>;
}
