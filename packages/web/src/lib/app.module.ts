import { Module } from '@nestjs/common';
import { StrategyController } from './controllers/strategy'
import { UDFController } from './controllers/udf'
import { EventsGateway } from './events/events.gateway'

@Module({
  controllers: [UDFController, StrategyController],
  providers: [EventsGateway],
})
export class AppModule {
}
