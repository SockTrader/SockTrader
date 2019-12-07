import fs from "fs";
import path from "path";
import util from "util";
import {exchanges} from "../core/exchanges";
import {CandleInterval} from "../core/types/candleInterval";

export async function loadStrategy(strategyFilename: string) {
    const strategyPath = path.resolve(__dirname, "./../../strategies", strategyFilename);
    return import(strategyPath);
}

export async function loadCandleFile(candleFilename: string) {
    const candlePath = path.resolve(__dirname, "./../../data", `${candleFilename}.json`);
    return import(candlePath);
}

export async function loadFiles(folder: string) {
    const readdir = util.promisify(fs.readdir);
    return readdir(path.resolve(folder));
}

export function getBaseFilenames(files: string[]): string[] {
    return files
        .map(f => f.split(".")[0])
        .filter((value, index, self) => self.indexOf(value) === index);
}

export function getExchangeInterval(exchangeName: string, interval: string): CandleInterval {
    const exchangeConfig = exchanges[exchangeName];
    if (!exchangeConfig) throw new Error(`Could not find exchange: ${exchangeName}`);

    const intervalConfig = exchangeConfig.intervals[interval];
    if (!intervalConfig) throw new Error(`Could not find interval: ${interval}`);

    return intervalConfig;
}
