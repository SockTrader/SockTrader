[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Coverage](https://codecov.io/gh/cwouter/SockTrader/branch/master/graph/badge.svg)](https://codecov.io/gh/cwouter/SockTrader)
[![Build Status](https://travis-ci.org/cwouter/SockTrader.svg?branch=master)](https://travis-ci.org/cwouter/SockTrader)
[![Maintainability](https://api.codeclimate.com/v1/badges/4ff5f03cd3df6fe8f776/maintainability)](https://codeclimate.com/github/cwouter/SockTrader/maintainability)
[![Dependencies](https://david-dm.org/cwouter/SockTrader.svg)](https://david-dm.org/cwouter/SockTrader)


# Cryptocurrency trading bot
##### WebSocket and event based trading bot written in TypeScript. 

Project is currently under development!


### Quick start

Clone project
```bash
git clone https://github.com/cwouter/SockTrader
```

Install dependencies
```bash
npm run install
```

Run bot!
```bash
npm run compile
```

### Configuration

**HitBTC is the only supported exchange**
**More exchanges will follow soon..**
  
Copy credentials.json.dist to credentials.json and replace publicKey and secretKey with the exchange credentials.


### How to write your own strategy?

First you need to create an entry file `index.ts` to initialize the framework.
Example:
```typescript
#!/usr/bin/env node
import HitBTC, {CandleInterval} from "./core/exchanges/hitBTC";
import SockTrader from "./core/sockTrader";
import MyStrategy from "./strategies/myStrategy";

// noinspection TsLint
const credentials = require("../credentials.json");

const sockTrader = new SockTrader();
const hitBTC = HitBTC.getInstance(credentials.publicKey, credentials.secretKey);

sockTrader.addExchange(hitBTC);
sockTrader.addStrategy({
    strategy: MyStrategy,
    pair: "BTCUSD",
    interval: CandleInterval.FIVE_MINUTES,
    exchange: hitBTC,
});
sockTrader.start();
```

And secondly create a strategy file: `src/strategies/myStrategy.ts`
Example:
```typescript
import {ICandle} from "../core/candleCollection";
import Orderbook from "../core/orderbook";
import Strategy from "../core/strategy";

export default class MyStrategy extends Strategy {

    public notifyOrder(data: any): void {
        // Will be called when the exchange confirms an order
    }

    public updateCandles(candleCollection: ICandle[]): void {
        // Will be called on each new candle
        this.buy("BTCUSD", 1000, 10);
        this.sell("BTCUSD", 2000, 10);
    }

    public updateOrderbook(orderbook: Orderbook): void {
        // Will be called on each exchange orderbook update
    }
}
```


# We need your help!
We're looking for extra contributors to give this project a well deserved boost.


## DISCLAIMER
    Using a trading bot does not mean guaranteed profit. 
    Also, trading crypto currency is considered high risk.
    Losses are possible, which SockTrader cannot be held responsible for.
