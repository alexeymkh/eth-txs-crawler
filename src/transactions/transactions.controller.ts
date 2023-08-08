import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Query,
  Logger,
} from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { GetTxsQuery } from './dtos/get-txs-query.dto';
import { ITransaction } from './interfaces/transaction.interface';

@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @HttpCode(200)
  async getTxs(@Query() query: GetTxsQuery): Promise<{ txs: ITransaction[] }> {
    try {
      const txs = await this.transactionsService.getTxs(
        query.address,
        query.startBlock,
        query.page,
        query.offset,
      );
      return { txs };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }
}
