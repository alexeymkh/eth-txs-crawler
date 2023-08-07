import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ICacheRepository } from '../interfaces/cache-repository.interface';
import { Transaction } from '../schemas/transaction.schema';
import { CacheUpdateRecord } from '../schemas/cache-update-record.schema';
import { SortOrder } from '../transactions.types';
import { ITransaction } from '../interfaces/transaction.interface';

@Injectable()
export class MongoDBRepo implements ICacheRepository {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(CacheUpdateRecord.name)
    private cacheUpdateRecordModel: Model<CacheUpdateRecord>,
  ) {}

  async getTransactions(
    address: string,
    startBlock: number,
    page: number,
    offset: number,
    sort: SortOrder,
  ): Promise<ITransaction[]> {
    return await this.transactionModel
      .find({
        $or: [{ from: address }, { to: address }],
        blockNumber: { $gte: startBlock },
      })
      .skip((page - 1) * offset)
      .limit(offset)
      .sort({ blockNumber: sort })
      .exec();
  }

  async saveTransactions(txs: ITransaction[]): Promise<void> {
    try {
      await this.transactionModel.insertMany(txs, { ordered: false });
    } catch (error) {
      if (error.code === 11000) {
        return;
      } else {
        throw error;
      }
    }
  }

  async getLastTxBlockNumber(address: string): Promise<number> {
    const tx = await this.transactionModel
      .findOne({
        $or: [{ from: address }, { to: address }],
      })
      .sort({ blockNumber: 'desc' })
      .exec();

    return tx ? tx.blockNumber : -1;
  }

  async getOldestBlockNumberOfCacheUpdatesRecords(
    address: string,
  ): Promise<number> {
    const tx = await this.cacheUpdateRecordModel
      .findOne({ address })
      .sort({ startBlockNumber: 'asc' })
      .exec();

    return tx ? tx.startBlockNumber : -1;
  }

  async saveCacheUpdateRecord(
    address: string,
    startBlockNumber: number,
  ): Promise<void> {
    await this.cacheUpdateRecordModel.create({
      address,
      startBlockNumber,
    });
  }
}
