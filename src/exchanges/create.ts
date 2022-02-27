import { Exchange } from '../core/interfaces/exchange.interfaces';
import { Strategy } from '../core/interfaces/strategy.interfaces';
import { pool } from '../core/pool';
import { LOG, log } from '../utils/log';

const persistActions = <T extends Exchange>(exchange: T, strategy: Strategy) => {
  const originalOnStop = strategy.onStop.bind(strategy);
  const orderSubs = exchange.orders$.subscribe((order) => {
    //eslint-disable-next-line no-console
    console.log('save order', order);
    const result = pool.query('SELECT NOW()');
    console.log('result: ', result);
  });

  const tradesSubs = exchange.trades$.subscribe((trade) => {
    //eslint-disable-next-line no-console
    console.log('save trade', trade);
  });

  strategy.onStop = () => {
    orderSubs.unsubscribe();
    tradesSubs.unsubscribe();
    originalOnStop();
  };
};

const logActions = <T extends Exchange>(exchange: T) => {
  const originalCandles = exchange.candles.bind(exchange);
  exchange.candles = (options: unknown) => {
    let prefix = '';
    if (typeof options === 'string') {
      prefix = options;
    } else if (typeof options === 'object') {
      const interval = (options as any)?.interval;
      prefix = (options as any)?.symbol + (interval ? '@' + interval : '');
    }

    return originalCandles(options).pipe(
      log(`${prefix} candles`, LOG.verbose)
    );
  };

  exchange.trades$ = exchange.trades$.pipe(log('Trades'));
  exchange.orders$ = exchange.orders$.pipe(log('Orders'));
};


export const createExchange = <T extends Exchange>(exchange: T, strategy: Strategy): T => {
  logActions(exchange);
  persistActions(exchange, strategy);

  return exchange;
};
