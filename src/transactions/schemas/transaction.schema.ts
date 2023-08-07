import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ITransaction } from '../interfaces/transaction.interface';

@Schema({ strict: false, timestamps: true })
export class Transaction implements ITransaction {
  @Prop({ required: true, index: true })
  blockNumber: number;

  @Prop({ required: true, unique: true })
  hash: string;

  @Prop()
  blockHash: string;

  @Prop()
  timeStamp: string;

  @Prop()
  nonce: string;

  @Prop()
  transactionIndex: string;

  @Prop()
  from: string;

  @Prop()
  to: string;

  @Prop()
  amountInWei: string;

  @Prop()
  amount: string;

  @Prop()
  decimals: string;

  @Prop()
  symbol: string;

  @Prop()
  gas: string;

  @Prop()
  gasPrice: string;

  @Prop()
  input: string;

  @Prop()
  methodId: string;

  @Prop()
  functionName: string;

  @Prop()
  contractAddress: string;

  @Prop()
  cumulativeGasUsed: string;

  @Prop()
  txreceipt_status: string;

  @Prop()
  gasUsed: string;

  @Prop()
  confirmations: string;

  @Prop()
  isError: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
