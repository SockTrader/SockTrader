import { Body, Controller, Post } from '@nestjs/common';
import { Worker } from '@socktrader/core';

@Controller('strategy')
export class StrategyController {
  @Post('run')
  async run(@Body('strategy') strategy: string) {
    try {
      const worker = new Worker();
      worker.run(strategy);
    } catch (e) {
      console.error(e);
    }

    return 'hello world';
  }
}
