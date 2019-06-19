<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/SockTrader/SockTrader/master/docs/assets/SockTraderLogo.png" alt="SockTrader logo" /></p>

<h1 align="center">SockTrader</h1>
<p align="center"><b>Cryptocurrency trading bot</b></p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg" alt="License: GPL v3"></a>
  <a href="https://codecov.io/gh/SockTrader/SockTrader"><img src="https://codecov.io/gh/SockTrader/SockTrader/branch/master/graph/badge.svg" /></a>
  <a href="https://stryker-mutator.github.io"><img src="https://badge.stryker-mutator.io/github.com/SockTrader/SockTrader/master" /></a>
  <a href="https://travis-ci.org/SockTrader/SockTrader"><img src="https://travis-ci.org/SockTrader/SockTrader.svg?branch=master" alt="Build status"></a>
  <a href="https://codeclimate.com/github/SockTrader/SockTrader/maintainability"><img src="https://api.codeclimate.com/v1/badges/19589f9237d31ca9dcf6/maintainability" /></a>
  <a href="https://david-dm.org/SockTrader/SockTrader"><img src="https://david-dm.org/SockTrader/SockTrader.svg" alt="Dependencies"></a>
  <a href="https://gitter.im/SockTrader/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge"><img src="https://badges.gitter.im/SockTrader/community.svg" alt="Gitter"></a>
</p>

<p align="center"><b>🚧 Project is currently under development! 🚧</b></p>

## Features

- 🚀 Realtime super-fast websocket trading.
- 📈 50+ Technical indicators. ([docs](https://github.com/anandanand84/technicalindicators))
- 🌈 Written in TypeScript!
- 🌿 Unit tested source code.
- 💎 Strategy testing with LIVE exchange data.
- 🏡 Backtesting engine with local data.
- ⚡️ Test & live reload your strategy in [our online dashboard](https://cryptocointrader.be/)!
- More features soon..

## Use our online dashboard!
Any strategy that has been developed in SockTrader can be backtested using our online dashboard. Once you change and save the code 
of the selected strategy the dashboard should automatically update itself and rerun the backtest.

Try it yourself:
1. Follow our [Quick Start guide](#quick-start)
2. Run `npm run web` and leave all settings as default. 
3. Go to [our online dashboard](https://cryptocointrader.be/) and test your strategies! 

![SockTraderDashboard](docs/assets/dashboard.png)

## Getting started

## Quick start

1. Clone the repository locally: `git clone https://github.com/SockTrader/SockTrader`
2. Install dependencies: `cd SockTrader && npm install`
3. Add trading bot configuration: `cp src/config.ts.dist src/config.ts `
4. Edit `src/config.ts` if needed
5. Transform our candle data (BTC/USD Bitstamp) from `src/data` to a readable format in `build/data`: `npm run normalize`
6. Run backtest with the normalized candles and the simple moving average strategy! `npm run backtest -- --candles=bitstamp_btcusd_1h --strategy=simpleMovingAverage`

## Advanced

Load your own candle data of a trading pair of your interest: [Create a candle normalizer in "src/data" folder](#normalize-raw-candles)

Create your own strategy [Create your own strategy](#your-own-strategy)

## Available scripts

- `npm run test` run jest test suite
- `npm run backtest` start backtest scripts
- `npm run normalize` start normalization process for all normalizers found in `src/data` 
- `npm run web-dev` start development webserver with nodemon for quick & easy development 
- `npm run web` start webserver. Can be used for "live reload" using websockets

## Normalize raw candles

### Add raw candle data

Download raw candles from a trusted source in json or csv format and copy this file to the `src/data` folder.

### Create a candle normalizer

A candle normalizer is a small utility script that is tightly coupled to a raw candle file. It will normalize the candles
from a raw csv or json file and output them in a generic format in the `build/data` folder. This normalization process
can be triggered by running: `npm run normalize`.

The expected output of a normalizer is a IDataFrame interface from [data-forge](https://www.npmjs.com/package/data-forge).
Each row in the data frame should respect the following type definition:
```
{
  timestamp: Moment,
  high: number,
  low: number,
  open: number,
  close: number,
  volume: number,
}
```

Redundant properties which are not listed in the type definition above will be ignored by the trading bot.
If you run into any issue, consider removing them as well by calling `.dropSeries(["REDUNDANT_PROPERTY"])` since we cannot
guarantee that it will still work in the future. Data-forge and moment are already included as a dependency and they are
used throughout the SockTrader codebase.

The following example will give you a good idea of how you can create your own candle normalizer. Make sure to put this file
into the `src/data` folder next to the raw candle files. Preferably with the same name as the candle file but with .ts extension.

Example:
```typescript
// src/data/bitstamp_btcusd_1h.ts
import {IDataFrame} from "data-forge";
import moment from "moment";
import path from "path";
import CandleNormalizer from "../sockTrader/core/candles/candleNormalizer";

// Be sure to go back to the src folder, since this script will be executed from the build/data folder!!
const SRC_PATH = "../../src/data";
const PATH = path.resolve(__dirname, SRC_PATH, "bitstamp_btcusd_1h.csv");

const parser = (dataFrame: IDataFrame<number, any>): IDataFrame<number, any> => {
    return dataFrame
        .dropSeries(["Symbol"]) // Redundant property
        .renameSeries({
            "Date": "timestamp",
            "High": "high",
            "Low": "low",
            "Open": "open",
            "Close": "close",
            "Volume To": "volume",
        })
        .select(row => {
            row.timestamp = moment(row.timestamp, "YYYY-MM-DD hh-A");
            return row;
        })
};

export default new CandleNormalizer(PATH, parser);
```

## Your own strategy?
Take a look at the given example strategy in this repository: [simpleMovingAverage strategy](src/strategies/simpleMovingAverage.ts)
 

## We need your help!
We're looking for extra contributors to give this project a well deserved boost.
Don't hesitate to contact us on: [Telegram](https://t.me/SockTrader) or [Gitter](https://gitter.im/SockTrader/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Or you can also support us by:
1. [Donating money](https://www.patreon.com/bePatron?u=19856242) for covering the hosting costs
2. Pay for advertisements on the SockTrader dashboard
3. Or sharing interesting knowledge with the community

[Become a Patron!](https://www.patreon.com/bePatron?u=19856242)

## ROADMAP
### v1.0
- Improve communication between dashboard & SockTrader
- Update and improve live trading
- Test edge case scenarios (possible rounding issues)
- Test altcoin trading and improve if needed
- Add basic backtest analyzers
- Dashboard internationalization
- Improve dashboard architecture
- Increase test coverage and test quality
- Add more and better documentation

### Later on..
- Improve logging
- Add extra exchanges
- Add more advanced backtest analyzers
- Show status of wallet in dashboard
- Show status of analyzers in dashboard
- And so much more..

Let us know if you have great ideas to improve the project!
Feel free to open a pull request.

## Contributors

[<img alt="cwouter" src="https://avatars3.githubusercontent.com/u/1439383?v=4&s=117" width="117">](https://github.com/cwouter)[<img alt="thijs-raets" src="https://avatars1.githubusercontent.com/u/1255632?v=4&s=117" width="117">](https://github.com/thijs-raets)

## DISCLAIMER
    Using a trading bot does not mean guaranteed profit. 
    Also, trading crypto currency is considered high risk.
    Losses are possible, which SockTrader cannot be held responsible for.
