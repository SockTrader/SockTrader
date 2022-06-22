import { IsNotEmpty } from 'class-validator';

export class GetSearchRequest {
  @IsNotEmpty()
  query!: string;

  @IsNotEmpty()
  type!: string;

  @IsNotEmpty()
  exchange!: string;

  @IsNotEmpty()
  limit!: number;
}
