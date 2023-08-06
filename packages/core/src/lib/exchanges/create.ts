import { Exchange, Order, Strategy, Trade } from '../interfaces';
import { insertOrder, insertTrade } from '../repositories';
import { LOG, log, noop } from '../utils';

const persistActions = <T extends Exchange>(
  exchange: T,
  strategy: Strategy
) => {
  const originalOnStop = strategy.onStop?.bind(strategy) ?? noop;

  const orderSubs = exchange.orders$.subscribe((o: Order) => insertOrder(o));
  const tradesSubs = exchange.trades$.subscribe((t: Trade) => insertTrade(t));

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

    return originalCandles(options).pipe(log(`${prefix} candles`, LOG.verbose));
  };

  exchange.trades$ = exchange.trades$.pipe(log('Trades'));
  exchange.orders$ = exchange.orders$.pipe(log('Orders'));
};

export const createExchange = <T extends Exchange>(
  exchange: T,
  strategy: Strategy
): T => {
  logActions(exchange);
  persistActions(exchange, strategy);

  return exchange;
};
