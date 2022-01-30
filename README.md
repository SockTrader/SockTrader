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
  <a href="https://david-dm.org/SockTrader/SockTrader"><img src="https://david-dm.org/SockTrader/SockTrader.svg" alt="Dependencies"></a>
  <a href="https://gitter.im/SockTrader/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge"><img src="https://badges.gitter.im/SockTrader/community.svg" alt="Gitter"></a>
</p>

<p align="center"><b>🚧 Project is currently under development! 🚧</b></p>

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
- 📝 Paper trading a strategy on LIVE exchange data.
- 🏡 Backtesting engine with local data.
- 🚢 Run SockTrader inside a docker container.
- More features soon..

## Getting started

# Quickstart

1. Install NodeJS dependencies. `npm i`
2. Run the entry script. `npm start`

## Additional scripts

- Development watch mode. `npm run watch`
- Production build. `npm run build`
- Build and execute production build. `npm run start:prod`
- Run test suite. `npm test`

# Infrastructure

## Database

The database can be started by running `docker-compose up`. This will start a `PostgresQl` database on port `5432`.

## PgAdmin

Pgadmin can be used to administer the database. This will be accessible using `localhost:5050` once docker compose is up and running.

## Connection details

### Postgresql

    Host: localhost
    Port: 5432
    Database: socktrader
    Username: socktrader
    Password: socktrader

### PgAdmin

    Host: localhost
    Port: 5050
    Password: socktrader

## Connecting to your Binance account

Since you do not want your API key and API secret to be pushed by accident, the actual configuration file has been ignored from the repository.
But you can start from an example file and fill in the necessary details:
1. copy config/default.json to config/local.json
2. go to your Binance account under API Management, create a new API key
3. provide the apiSecret and apiKey in config/local.json and you're good to go!

### API key restrictions

By default the newly created API key does not allow you to place orders, only reads are allowed.
To get started:

1. go to your Binance account
2. under API restrictions enable 'Enable Spot & Margin Trading'

## Contributors
<a href="https://github.com/SockTrader/SockTrader/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SockTrader/SockTrader" />
</a>

## DISCLAIMER
    Using a trading bot does not mean guaranteed profit.
    Also, trading crypto currency is considered high risk.
    Losses are possible, which SockTrader cannot be held responsible for.
