#!/usr/bin/env node
import path from "path";
import "source-map-support/register";
import yargs from "yargs";
import config from "./config";
import BackTester from "./sockTrader/core/bot/backTester";
import {CandleInterval} from "./sockTrader/core/exchanges/hitBTC";
import IPCReporter from "./sockTrader/core/reporters/IPCReporter";

const argv = yargs
    .usage("Usage: $0 --candles [string] --strategy [string]")
    .option("candles", {
        string: true,
        demandOption: true,
        description: "Candle filename found under src/data",
    })
    .option("strategy", {
        string: true,
        demandOption: true,
        description: "Strategy name found under src/strategies",
    })
    .argv;

async function load() {
    const strategyPath = path.resolve(__dirname, "./strategies", argv.strategy);
    const candlePath = path.resolve(__dirname, "./data", `${argv.candles}.json`);

    return await Promise.all(
        [import(strategyPath), import(candlePath)]
            .map(p => p.catch((err: any) => ({error: err}))),
    );
}

load().then((dep: any) => {
    const strategyFile = dep[0].default;
    const candleFile = dep[1].default;

    const backtest = new BackTester({assets: config.assets}, candleFile.candles)
        .addStrategy({
            strategy: strategyFile,
            pair: candleFile.symbol,
            interval: CandleInterval.ONE_HOUR, // @TODO make interval dynamic
        });

    if (process.send) backtest.addReporter(new IPCReporter());

    backtest.start();
});
