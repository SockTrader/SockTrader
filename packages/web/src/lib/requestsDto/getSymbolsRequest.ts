import { IsNotEmpty } from 'class-validator';

export class GetSymbolsRequest {
  @IsNotEmpty()
  symbol!: string;
}
