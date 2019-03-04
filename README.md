<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/SockTrader/SockTrader/master/docs/assets/SockTraderLogo.png" alt="SockTrader logo" /></p>

<h1 align="center">SockTrader</h1>
<p align="center"><b>Cryptocurrency trading bot</b></p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg" alt="License: GPL v3"></a>
  <a href="https://codecov.io/gh/SockTrader/SockTrader"><img src="https://codecov.io/gh/SockTrader/SockTrader/branch/master/graph/badge.svg" /></a>
  <a href="https://travis-ci.org/SockTrader/SockTrader"><img src="https://travis-ci.org/SockTrader/SockTrader.svg?branch=master" alt="Build status"></a>
  <a href="https://codeclimate.com/github/SockTrader/SockTrader/maintainability"><img src="https://api.codeclimate.com/v1/badges/19589f9237d31ca9dcf6/maintainability" /></a>
  <a href="https://david-dm.org/SockTrader/SockTrader"><img src="https://david-dm.org/SockTrader/SockTrader.svg" alt="Dependencies"></a>
</p>

<p align="center"><b>🚧 Project is currently under development! 🚧</b></p>

## Features

- 🚀 Realtime super-fast websocket trading.
- 📈 50+ Technical indicators. ([docs](https://github.com/anandanand84/technicalindicators))
- 🌈 Written in TypeScript!
- 🌿 Unit tested source code.
- 💎 Strategy testing with LIVE exchange data.
- 🏡 Backtesting engine with local data.
- ⚡️ Live reload any strategy in your own frontend. ([see example](#whats-the-purpose-of-the-webserver))
- 📡 Connect your frontend to the integrated websocket server. ([see example](#whats-the-purpose-of-the-webserver))
- More features soon..

## Getting started

## Quick start

1. Clone the repository locally: `git clone https://github.com/SockTrader/SockTrader`
2. Install dependencies: `cd SockTrader && npm run install`
3. Add trading bot configuration: `cp src/config.ts.dist src/config.ts `
4. Edit `src/config.ts` if needed
5. [Create a candle normalizer in "src/data" folder](#normalize-raw-candles)
6. Run backtest! `npm run backtest -- --candles=bitstamp_btcusd_1h --strategy=simpleMovingAverage`

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
import CandleLoader from "../sockTrader/core/candles/candleLoader";

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

export default new CandleLoader(PATH, parser);
```

## Your own strategy?

Take a look at the given example strategy in this repository: [simpleMovingAverage strategy](src/strategies/simpleMovingAverage.ts)

## What's the purpose of the webserver?

One might think that the webserver is useless since the tradingbot can be controlled using the CLI. But that's not true, because we're
also developing a custom dashboard that is able to control the tradingbot. With this dashboard we're able to see the trading 
actions of our strategy happening live on the dashboard as we're programming it.

Unfortunately we're not allowed to make it open source due to license restrictions of the TradingView library that we're using.

In any case, here you have a preview: 
![SockTraderDashboard](docs/assets/SockTraderDashboard.png)
 

## We need your help!
We're looking for extra contributors to give this project a well deserved boost.

## Contributors

[<img alt="cwouter" src="https://avatars3.githubusercontent.com/u/1439383?v=4&s=117" width="117">](https://github.com/cwouter)[<img alt="thijs-raets" src="https://avatars1.githubusercontent.com/u/1255632?v=4&s=117" width="117">](https://github.com/thijs-raets)

## DISCLAIMER
    Using a trading bot does not mean guaranteed profit. 
    Also, trading crypto currency is considered high risk.
    Losses are possible, which SockTrader cannot be held responsible for.
