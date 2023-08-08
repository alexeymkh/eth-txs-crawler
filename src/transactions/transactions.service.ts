import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { IRepository } from './interfaces/repository.interface';
import { ICacheRepository } from './interfaces/cache-repository.interface';
import {
  CACHE_REPO,
  ORIGIN_SOURCE_REPO,
  UPDATE_CACHE_EVENT,
} from './transactions.constants';
import { ITransaction } from './interfaces/transaction.interface';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  private mutexForCacheUpdatingByAddresses = new Set<string>();

  constructor(
    @Inject(ORIGIN_SOURCE_REPO) private originSourceRepo: IRepository,
    @Inject(CACHE_REPO) private cacheRepo: ICacheRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async getTxs(
    address: string,
    startBlock: number,
    page: number,
    offset: number,
  ): Promise<ITransaction[]> {
    if (await this.areRequestedTxsCached(address, startBlock)) {
      this.logger.log(`getTxs from cache for ${address}`);
      return this.cacheRepo.getTransactions(
        address,
        startBlock,
        page,
        offset,
        'desc',
      );
    }

    this.logger.log(`getTxs from origin source for ${address}`);

    this.eventEmitter.emit(UPDATE_CACHE_EVENT, {
      address,
      startBlock,
    });

    return this.originSourceRepo.getTransactions(
      address,
      startBlock,
      page,
      offset,
      'desc',
    );
  }

  async areRequestedTxsCached(
    address: string,
    startBlock: number,
  ): Promise<boolean> {
    const {
      lastBlockNumberFromCache,
      lastBlockNumberFromOriginSource,
      oldestBlockNumberOfCacheUpdateRecords,
    } = await this.getTxsBlocksNumbersFromRepos(address);

    return (
      lastBlockNumberFromCache === lastBlockNumberFromOriginSource &&
      startBlock >= oldestBlockNumberOfCacheUpdateRecords
    );
  }

  async getTxsBlocksNumbersFromRepos(address: string): Promise<{
    oldestBlockNumberOfCacheUpdateRecords: number;
    lastBlockNumberFromCache: number;
    lastBlockNumberFromOriginSource: number;
  }> {
    const [res0, res1, res2] = await Promise.allSettled([
      this.cacheRepo.getLastTxBlockNumber(address),
      this.originSourceRepo.getLastTxBlockNumber(address),
      this.cacheRepo.getOldestBlockNumberOfCacheUpdatesRecords(address),
    ]);

    if (res0.status !== 'fulfilled') {
      throw new Error('Error while getting last block number from cache');
    }

    if (res1.status !== 'fulfilled') {
      throw new Error(
        'Error while getting last block number from origin source',
      );
    }

    if (res2.status !== 'fulfilled') {
      throw new Error(
        'Error while getting oldest block number of cache updates',
      );
    }

    return {
      lastBlockNumberFromCache: res0.value,
      lastBlockNumberFromOriginSource: res1.value,
      oldestBlockNumberOfCacheUpdateRecords: res2.value,
    };
  }

  @OnEvent(UPDATE_CACHE_EVENT)
  async handleUpdateCacheEvent({
    address,
    startBlock,
  }: {
    address: string;
    startBlock: number;
  }) {
    if (this.isCacheUpdatingBlocked(address)) {
      return;
    }

    this.blockCacheUpdate(address);

    const initialStartBlock = startBlock;

    try {
      this.logger.log(`Start saving cache for ${address}`);

      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lastBlockNumberFromCache,
        lastBlockNumberFromOriginSource,
        oldestBlockNumberOfCacheUpdateRecords,
      } = await this.getTxsBlocksNumbersFromRepos(address);

      let endBlock = lastBlockNumberFromOriginSource;

      if (startBlock < oldestBlockNumberOfCacheUpdateRecords) {
        endBlock = oldestBlockNumberOfCacheUpdateRecords;
      }

      while (startBlock < endBlock) {
        const txs = await this.originSourceRepo.getTransactions(
          address,
          startBlock,
          1,
          20,
          'asc',
        );

        await this.cacheRepo.saveTransactions(txs);

        startBlock = txs[txs.length - 1].blockNumber;
      }

      await this.cacheRepo.saveCacheUpdateRecord(address, initialStartBlock);

      this.logger.log(`End saving cache for ${address}`);
    } catch (error) {
      this.logger.error(error);
    }

    this.unblockCachUpdate(address);
  }

  isCacheUpdatingBlocked(address: string): boolean {
    return this.mutexForCacheUpdatingByAddresses.has(address);
  }

  blockCacheUpdate(address: string): void {
    this.mutexForCacheUpdatingByAddresses.add(address);
  }

  unblockCachUpdate(address: string): void {
    this.mutexForCacheUpdatingByAddresses.delete(address);
  }
}
