import { IsString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTxsQuery {
  @Transform(({ value }) => value.toLowerCase())
  @IsString()
  address: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  startBlock: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(20)
  offset: number;
}
