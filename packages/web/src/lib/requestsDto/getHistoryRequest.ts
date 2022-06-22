import { IsNotEmpty } from 'class-validator';

export class GetHistoryRequest {

  @IsNotEmpty()
  symbol!: string;

  @IsNotEmpty()
  from!: number;

  @IsNotEmpty()
  to!: number;

  @IsNotEmpty()
  resolution!: string;

  @IsNotEmpty()
  countback!: number;
}
