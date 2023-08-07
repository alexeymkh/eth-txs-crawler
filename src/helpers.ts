import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';

@Injectable()
export class Helpers {
  convertFromWei(wei: string, decimals: number): string {
    const divisor = new BigNumber(10).pow(decimals);
    const eth = new BigNumber(wei).dividedBy(divisor);
    return eth.toString();
  }
}
