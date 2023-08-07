import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { IRepository } from '../interfaces/repository.interface';
import { ITransaction } from '../interfaces/transaction.interface';
import { SortOrder } from '../transactions.types';
import {
  ETH_DECIMALS,
  ETH_SYMBOL,
  UNKNOWN_DECIMALS,
  UNKNOWN_SYMBOL,
} from '../transactions.constants';
import { Helpers } from '../../helpers';

@Injectable()
export class EtherscanRepo implements IRepository {
  private readonly logger = new Logger(EtherscanRepo.name);

  private readonly apiUrl: string;

  private readonly apiKey: string;

  constructor(private helpers: Helpers, private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('ETHERSCAN_API_URL');
    this.apiKey = this.configService.get<string>('ETHERSCAN_API_KEY');
  }

  async getTransactions(
    address: string,
    startBlock: number,
    page: number,
    offset: number,
    sort: SortOrder,
  ): Promise<ITransaction[]> {
    const params = {
      module: 'account',
      action: 'txlist',
      address,
      startblock: startBlock,
      page,
      offset,
      sort,
      apikey: this.apiKey,
    };

    try {
      const response = await axios.get(this.apiUrl, { params });
      if (response.data.status !== '1') {
        throw new Error(response.data.message);
      }

      return this.mapResponseArrayToTransactions(response.data.result);
    } catch (error) {
      this.logger.error(error);
      throw new Error(error.message);
    }
  }

  mapResponseArrayToTransactions(responseArray: any): ITransaction[] {
    if (!Array.isArray(responseArray)) {
      throw new Error('Response is not an array');
    }

    return responseArray.map((respTx: any) => {
      let amount = respTx.value;
      let decimals = UNKNOWN_DECIMALS;
      let symbol = UNKNOWN_SYMBOL;

      if (respTx.value !== '0') {
        amount = this.helpers.convertFromWei(respTx.value, ETH_DECIMALS);
        decimals = ETH_DECIMALS.toString();
        symbol = ETH_SYMBOL;
      }

      const tx: ITransaction = {
        amount,
        decimals,
        symbol,
        amountInWei: respTx.value,
        blockNumber: parseInt(respTx.blockNumber, 10),
        blockHash: respTx.blockHash,
        timeStamp: respTx.timeStamp,
        hash: respTx.hash,
        nonce: respTx.nonce,
        transactionIndex: respTx.transactionIndex,
        from: respTx.from,
        to: respTx.to,
        gas: respTx.gas,
        gasPrice: respTx.gasPrice,
        input: respTx.input,
        methodId: respTx.methodId,
        functionName: respTx.functionName,
        contractAddress: respTx.contractAddress,
        cumulativeGasUsed: respTx.cumulativeGasUsed,
        txreceipt_status: respTx.txreceipt_status,
        gasUsed: respTx.gasUsed,
        confirmations: respTx.confirmations,
        isError: respTx.isError,
      };

      return tx;
    }) as ITransaction[];
  }

  async getLastTxBlockNumber(address: string): Promise<number> {
    const [tx] = await this.getTransactions(address, 0, 1, 1, 'desc');
    return tx.blockNumber;
  }
}
