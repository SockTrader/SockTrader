<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/SockTrader/SockTrader/master/docs/assets/SockTraderLogo.png" alt="SockTrader logo" /></p>

<h1 align="center">SockTrader</h1>
<p align="center"><b>Cryptocurrency trading bot</b></p>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg" alt="License: GPL v3"></a>
  <a href="https://codecov.io/gh/SockTrader/SockTrader"><img src="https://codecov.io/gh/SockTrader/SockTrader/branch/master/graph/badge.svg" /></a>
  <a href="https://sonarcloud.io/dashboard?id=SockTrader_SockTrader"><img src="https://sonarcloud.io/api/project_badges/measure?project=SockTrader_SockTrader&metric=reliability_rating" /></a>
  <a href="https://sonarcloud.io/dashboard?id=SockTrader_SockTrader"><img src="https://sonarcloud.io/api/project_badges/measure?project=SockTrader_SockTrader&metric=sqale_rating" /></a>
  <a href="https://circleci.com/gh/SockTrader"><img src="https://circleci.com/gh/SockTrader/SockTrader/tree/master.svg?style=shield" alt="Build status"></a>
  <a href="https://codeclimate.com/github/SockTrader/SockTrader/maintainability"><img src="https://api.codeclimate.com/v1/badges/19589f9237d31ca9dcf6/maintainability" /></a>
</p>

<p align="center"><b>Join the community <a href="https://join.slack.com/t/socktrader/shared_invite/zt-12ncj65l3-T7cacrk7~cEacjZUyxnamA"><img valign="middle" src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack" alt="Slack"></a></b></p>
<p align="center"><b>Checkout <a href="https://github.com/SockTrader/SockTrader/tree/socktrader-v2">SockTrader v2!</a></b></p>

## What is "SockTrader"?
SockTrader is an open source cryptocurrency trading bot. You can use it to automatically buy and/or sell cryptocurrencies based on a strategy that you've programmed.
The strategy basically contains a set of rules that will define when and how the bot should act in the cryptocurrency market. These rules can be based on technical analysis ([what is technical analysis?](https://www.investopedia.com/terms/t/technicalanalysis.asp))
or you could simply tell the bot to buy/sell at certain price levels. In fact, it's up to you to decide the rules of the game!    

The name "SockTrader" comes from web**sock**et based trading bot. Which means that SockTrader will try to make use of a realtime connection with the exchange. This has the advantage
that one can act very quickly in a changing market with low latency.  

## Features
- 🚀 Realtime super-fast websocket trading.
- 📈 50+ Technical indicators. ([docs](https://github.com/anandanand84/technicalindicators))
- 🌈 Written in TypeScript!
- 🌿 Unit tested source code.
- 🔫 Mutation testing for better testing quality
- 📝 Paper trading a strategy on LIVE exchange data.
- 🏡 Backtesting engine with local data.
- ⚡️ Test & live reload your strategy in [our online dashboard](https://socktrader.io/)!
- 🚢 Run SockTrader inside a docker container.
- More features soon..

## Use our online dashboard!
We've built an online dashboard that you can use to visually confirm all the trades that happened during a backtesting session. The dashboard
has a live reload functionality. So SockTrader will relaunch the current backtest once you've changed and saved the code of a strategy. All the trades
will be shown on the chart as you can see in the screenshot. 

Try it yourself:
1. Follow our [Quick Start guide](#quick-start)
2. Run `npm run web` and leave all settings as default. 
3. Go to [our online dashboard](https://socktrader.io/) and test your strategies! 

![SockTraderDashboard](docs/assets/dashboard.png)

## Getting started

## Quick start

### Dockerfile
1. Clone the repository locally: `git clone https://github.com/SockTrader/SockTrader`
2. Add trading bot configuration: `cp src/config.ts.dist src/config.ts `
3. (optional) Edit `src/config.ts`
4. Build docker image: `cd SockTrader && docker build -t socktrader .`
5. Start container: `docker run socktrader --help`

### Local scripts
1. Clone the repository locally: `git clone https://github.com/SockTrader/SockTrader`
2. Install dependencies: `cd SockTrader && npm install`
3. Create trading bot configuration file: `cp src/config.ts.dist src/config.ts `
4. Build project: `npm run build`
5. Transform our candle data (BTC/USD coinbase) from `src/data` to a readable format in `build/data`: `npm run normalize`
6. Run SockTrader: `node ./build/index.js --help`

## Other scripts
- `npm run test` run jest test suite
- `npm run web-dev` start development webserver with nodemon for quick & easy development 
- `npm run web` start webserver. Can be used for "live reload" using websockets
- `npm run socktrader -- backtest --candles=coinbase_btcusd_1h --strategy=simpleMovingAverage` start backtest trading session 
- `npm run socktrader -- live --paper --pair btc usd --strategy simpleMovingAverage --exchange hitbtc --interval 1m` start paper trading session

## Advanced
Load your own candle data of a trading pair of your interest: [Create a candle normalizer in "src/data" folder](#normalize-raw-candles)

Create your own strategy [Create your own strategy](#your-own-strategy)

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

The following example will give you a good idea of how you can create your own candle normalizer. Make sure to put this file
into the `src/data` folder next to the raw candle files. Preferably with the same name as the candle file but with .ts extension.

Example:
```typescript
// src/data/coinbase_btcusd_1h.ts
import {IDataFrame} from "data-forge";
import moment from "moment";
import path from "path";
import {Candle} from "../sockTrader/core/types/candle";
import CandleNormalizer from "../sockTrader/core/candles/candleNormalizer";
import CandleNormalizer, {CandleMetaInfo} from "../sockTrader/data/candleNormalizer";

const candleMeta: CandleMetaInfo = {symbol: ["BTC", "USD"], name: "Bitcoin"};

const parser = (dataFrame: IDataFrame): IDataFrame<number, Candle> => dataFrame
    .renameSeries({
        "Date": "timestamp",
        "High": "high",
        "Low": "low",
        "Open": "open",
        "Close": "close",
        "Volume USD": "volume",
    })
    .select(row => ({
        ...row,
        timestamp: moment.utc(row.timestamp, "YYYY-MM-DD hh-A"),
    }));

export default new CandleNormalizer("coinbase_btcusd_1h.csv", candleMeta, parser);
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
<a href="https://github.com/SockTrader/SockTrader/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SockTrader/SockTrader" />
</a>

## DISCLAIMER
    Using a trading bot does not mean guaranteed profit. 
    Also, trading crypto currency is considered high risk.
    Losses are possible, which SockTrader cannot be held responsible for.
