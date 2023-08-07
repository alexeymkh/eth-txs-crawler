import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ICacheUpdateRecord } from '../interfaces/cache-update-record.interface';

@Schema({ strict: false, timestamps: true })
export class CacheUpdateRecord implements ICacheUpdateRecord {
  @Prop({ required: true, index: true })
  startBlockNumber: number;

  @Prop({ required: true })
  address: string;
}

export const CacheUpdateRecordSchema =
  SchemaFactory.createForClass(CacheUpdateRecord);
