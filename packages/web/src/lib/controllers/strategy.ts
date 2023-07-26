import { Body, Controller, Get, Post } from '@nestjs/common'
import { Worker } from '@socktrader/core'
import * as process from 'process'
import { StartStrategyRequest } from '../requestsDto/startStrategyRequest'

@Controller('/strategy')
export class StrategyController {

  @Get('/list')
  async getAllStrategies() {
    // @TODO continue..
    //console.log(process.cwd(), __dirname)
  }

  @Post('/start')
  async startStrategy(@Body() startStrategyRequest: StartStrategyRequest) {
    const strategy = startStrategyRequest.strategy

    try {
      const worker = new Worker()
      worker.run(strategy)
    } catch (e) {
      console.error(e)
    }

    return 'hello world'
  }

}
