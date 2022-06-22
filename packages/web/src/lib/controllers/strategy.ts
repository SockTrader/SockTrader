import { Body, Controller, Post } from '@nestjs/common'
import { Worker } from '@socktrader/core'
import { StartStrategyRequest } from '../requestsDto/startStrategyRequest'

@Controller('/strategy')
export class StrategyController {

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
