import { Injectable } from '@nestjs/common';
import { UDF } from '../lib/udf/udf';

@Injectable()
export class UdfService {
  public readonly udf: UDF;

  constructor() {
    this.udf = new UDF();
  }

  config() {
    return this.udf.config();
  }

  symbolInfo() {
    return this.udf.symbolInfo();
  }

  getSymbol(symbol: string) {
    return this.udf.symbol(symbol);
  }

  search(query: string, type: string, exchange: string, limit: number) {
    return this.udf.search(query, type, exchange, limit);
  }

  history(
    symbol: string,
    from: number,
    to: number,
    resolution: string,
    countBack: number
  ) {
    return this.udf.history(symbol, from, to, resolution, countBack);
  }
}
