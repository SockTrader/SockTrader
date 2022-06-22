import { IsNotEmpty } from 'class-validator';

export class StartStrategyRequest {

  @IsNotEmpty()
  strategy!: string;

}
