<p align="center"><img width="160" height="160" src="https://raw.githubusercontent.com/SockTrader/SockTrader/master/docs/assets/socktrader_logo.png" alt="SockTrader logo" /></p>

<h1 align="center">@socktrader/cli</h1>

<p align="center">
  <a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg" alt="License: GPL v3"></a>
  <a href="https://codecov.io/gh/SockTrader/SockTrader"><img src="https://codecov.io/gh/SockTrader/SockTrader/branch/master/graph/badge.svg" /></a>
  <a href="https://sonarcloud.io/dashboard?id=SockTrader_SockTrader"><img src="https://sonarcloud.io/api/project_badges/measure?project=SockTrader_SockTrader&metric=reliability_rating" /></a>
  <a href="https://sonarcloud.io/dashboard?id=SockTrader_SockTrader"><img src="https://sonarcloud.io/api/project_badges/measure?project=SockTrader_SockTrader&metric=sqale_rating" /></a>
  <a href="https://circleci.com/gh/SockTrader"><img src="https://circleci.com/gh/SockTrader/SockTrader/tree/master.svg?style=shield" alt="Build status"></a>
  <a href="https://codeclimate.com/github/SockTrader/SockTrader/maintainability"><img src="https://api.codeclimate.com/v1/badges/19589f9237d31ca9dcf6/maintainability" /></a>
</p>

<p align="center"><b>Join the community <a href="https://join.slack.com/t/socktrader/shared_invite/zt-12ncj65l3-T7cacrk7~cEacjZUyxnamA"><img valign="middle" src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack" alt="Slack"></a></b></p>

## What is "SockTrader"?

SockTrader is an open source cryptocurrency trading bot. You can use it to automatically buy and/or sell cryptocurrencies based on a strategy that you've programmed.
The strategy basically contains a set of rules that will define when and how the bot should act in the cryptocurrency market. These rules can be based on technical analysis ([what is technical analysis?](https://www.investopedia.com/terms/t/technicalanalysis.asp))
or you could simply tell the bot to buy/sell at certain price levels. In fact, it's up to you to decide the rules of the game!

The name "SockTrader" comes from web**sock**et based trading bot. Which means that SockTrader will try to make use of a realtime connection with the exchange. This has the advantage
that one can act very quickly in a changing market with low latency.

## Sounds interesting?

:construction: Sorry, things are still WIP for now.. :construction:

You can already start discovering SockTrader with our 'demo app' below.
While we're doing everything we can to make the SockTrader CLI experience as smooth as possible.

### Start quick demo app

1. Git clone `git clone git@github.com:SockTrader/SockTrader.git && cd SockTrader`
2. Install NodeJS dependencies. `npm i`
3. Copy `config/default.json` to `config/local.json` and edit.
4. Start postgres database `docker-compose up`
5. Run the MovingAverageStrategy on LocalExchange. `npm run start:backtest`
