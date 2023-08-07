import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { EtherscanRepo } from './repositories/etherscan.repo';
import { MongoDBRepo } from './repositories/mongodb.repo';
import { CACHE_REPO, ORIGIN_SOURCE_REPO } from './transactions.constants';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import {
  CacheUpdateRecord,
  CacheUpdateRecordSchema,
} from './schemas/cache-update-record.schema';
import { Helpers } from '../helpers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: CacheUpdateRecord.name, schema: CacheUpdateRecordSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    {
      provide: ORIGIN_SOURCE_REPO,
      useClass: EtherscanRepo,
    },
    {
      provide: CACHE_REPO,
      useClass: MongoDBRepo,
    },
    Helpers,
  ],
})
export class TransactionsModule {}
