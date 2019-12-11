#!/usr/bin/env node
import "source-map-support/register";
import yargs from "yargs";
import BackTest from "./sockTrader/cli/backtest";
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
    }, args => new BackTest(args.candles, args.strategy).start())
    .command(["live"], "start trading a strategy on a remote exchange", {
        strategy: {
            alias: "S",
            describe: "name of the strategy file",
            string: true,
            required: true,
        },
        interval: {
            alias: "I",
            describe: "the time period of one bar",
            string: true,
            required: true,
        },
        pair: {
            alias: "P",
            describe: "trading pair that will be traded on the exchange",
            nargs: 2,
            array: true,
            required: true,
        },
        exchange: {
            alias: "E",
            describe: "exchange on which we will be trading",
            string: true,
            required: true,
        },
        force: {
            alias: "f",
            describe: "we won't ask for confirmation",
            boolean: true,
        },
        paper: {
            alias: "pt",
            describe: "run strategy with live data without spending money",
            boolean: true,
        },
    }, startLiveTrading)
    .command(["normalize", "norm", "n"], "prepare static data files for backtesting", {}, normalize)
    .demandCommand(1, "")
    .argv;
