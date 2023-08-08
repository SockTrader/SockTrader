import { Module } from '@nestjs/common';
import { StrategyController } from './controllers/strategy.controller';
import { UdfController } from './controllers/udf.controller';
import { UdfService } from './services/udf.service';

@Module({
  controllers: [UdfController, StrategyController],
  providers: [UdfService],
})
export class AppModule {}
