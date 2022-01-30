import { default as BinanceExchange } from 'binance-api-node';
import config from 'config';
import Binance from '../binance/binance';

export default class BinanceLocal extends Binance {

  constructor() {
    super();

    this._binance = BinanceExchange({
      ...config.get('exchanges.binanceLocal')
    });
  }

}
