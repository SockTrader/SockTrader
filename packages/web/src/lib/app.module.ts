import { Module } from '@nestjs/common';
import { StrategyController } from './controllers/strategy'
import { UDFController } from './controllers/udf'

@Module({
  controllers: [UDFController, StrategyController],
  providers: [],
})
export class AppModule {
}
