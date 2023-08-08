import { Controller, Get, Header, Inject, Query } from '@nestjs/common';
import { UdfService } from '../services/udf.service';

@Controller('udf')
export class UdfController {
  constructor(@Inject() protected udfService: UdfService) {}

  @Get('config')
  async getConfig() {
    return this.udfService.config();
  }

  @Get('time')
  @Header('Content-Type', 'text/plain')
  getTime() {
    const time = Math.floor(Date.now() / 1000);
    return time.toString();
  }

  @Get('symbol_info')
  getSymbolInfo() {
    return this.udfService.symbolInfo();
  }

  @Get('symbols')
  async getSymbols(@Query('symbol') symbol: string) {
    return this.udfService.getSymbol(symbol);
  }

  @Get('search')
  async getSearch(
    @Query('query') query: string,
    @Query('type') type: string,
    @Query('exchange') exchange: string,
    @Query('limit') limit: string
  ) {
    return this.udfService.search(query, type, exchange, parseInt(limit));
  }

  @Get('history')
  async getHistory(
    @Query('symbol') symbol: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('resolution') resolution: string,
    @Query('countback') countBack: string
  ) {
    return this.udfService.history(
      symbol,
      parseInt(from),
      parseInt(to),
      resolution,
      parseInt(countBack)
    );
  }
}
