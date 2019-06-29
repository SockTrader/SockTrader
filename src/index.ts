#!/usr/bin/env node
import "source-map-support/register";
import yargs from "yargs";
import {startBacktest} from "./sockTrader/cli/backtest";
import {listCandles, listStrategies} from "./sockTrader/cli/directoryListing";
import {listExchanges} from "./sockTrader/cli/exchange";
import {startLiveTrading} from "./sockTrader/cli/liveTrading";
import {normalize} from "./sockTrader/cli/normalize";
import startWebServer from "./sockTrader/web/webServer";

// tslint:disable-next-line:no-unused-expression
yargs
    .usage("Usage: $0 <command>")
    .command(["list-strategies", "ls"], "list all available strategies", {}, listStrategies)
    .command(["list-candles", "lcf", "lc"], "list all available candle files", {}, listCandles)
    .command(["list-exchanges", "le"], "list all available exchanges and its config", {}, listExchanges)
    .command(["web"], "start websocket server", {}, startWebServer)
    .command(["backtest", "bt"], "test a strategy on historical candle data", {
        candles: {
            alias: "C",
            describe: "name of the candle file",
            string: true,
            required: true,
        },
        strategy: {
            alias: "S",
            describe: "name of the strategy file",
            string: true,
            required: true,
        },
    }, startBacktest)
    .command(["live"], "start trading a strategy on a remote exchange", {
        strategy: {
            alias: "S",
            describe: "name of the strategy file",
            string: true,
            required: true,
        },
    }, (args: any) => {
        // @TODO finish live trading
    })
    .command(["normalize", "norm", "n"], "prepare static data files for backtesting", {}, normalize)
    .demandCommand(1, "")
    .argv;
