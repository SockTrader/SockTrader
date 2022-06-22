import { Controller, Get, Query } from '@nestjs/common'
import { GetHistoryRequest } from '../requestsDto/getHistoryRequest'
import { GetSearchRequest } from '../requestsDto/getSearchRequest'
import { GetSymbolsRequest } from '../requestsDto/getSymbolsRequest'
import { UDF } from '../udf'

@Controller('/udf')
export class UDFController {

  private udf = new UDF()

  @Get('/config')
  async getConfig() {
    return await this.udf.config()
  }

  @Get('/time')
  getTime() {
    const time = Math.floor(Date.now() / 1000)  // In seconds
    return time.toString()
  }

  @Get('/symbol_info')
  getSymbolInfo() {
    return this.udf.symbolInfo()
  }

  @Get('/symbols')
  async getSymbols(@Query() getSymbolsRequest: GetSymbolsRequest) {
    return await this.udf.symbol(getSymbolsRequest.symbol)
  }

  @Get('/search')
  async getSearch(@Query() getSearchRequest: GetSearchRequest) {
    return await this.udf.search(
      getSearchRequest.query,
      getSearchRequest.type,
      getSearchRequest.exchange,
      getSearchRequest.limit
    )
  }

  @Get('/history')
  async getHistory(@Query() getHistoryRequest: GetHistoryRequest) {
    return await this.udf.history(
      getHistoryRequest.symbol,
      getHistoryRequest.from,
      getHistoryRequest.to,
      getHistoryRequest.resolution,
      getHistoryRequest.countback
    )
  }


}
