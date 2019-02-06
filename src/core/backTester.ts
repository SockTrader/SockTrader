import fs from "fs";
import mkdirp from "mkdirp";
import {lowercase, numbers, uppercase} from "nanoid-dictionary";
import generate from "nanoid/generate";
import path from "path";
import rimraf from "rimraf";
import util from "util";
import {ICandle} from "./candleCollection";
import CandleLoader, {Parser} from "./candleLoader";
import localExchange from "./exchanges/localExchange";
import LocalExchange from "./exchanges/localExchange";
import {IOrder} from "./orderInterface";
import SockTrader, {ISockTraderConfig} from "./sockTrader";
import Wallet, {IAssetMap} from "./wallet";

export interface IBackTestConfig extends ISockTraderConfig {
    assets: IAssetMap;
}

/**
 * The BackTester enables you to test your strategy against a fake dummy exchange
 * and optimize to the point of content
 */
export default class BackTester extends SockTrader {

    private static CACHE_FOLDER = path.resolve(".sockTrader");
    // TODO optional but if not present error is thrown
    private candleLoader?: CandleLoader;

    /**
     * Creates a new BackTester
     * @param {ISockTraderConfig} config
     */
    constructor(config: IBackTestConfig) {
        super(config);

        const wallet = new Wallet(config.assets);
        this.exchange = localExchange.getInstance(wallet);
    }

    /**
     * Sets the loader responsible for loading local file data into
     * an in memory candle collection
     * @param {string} inputPath the path to the file containing candles
     * @param {Parser} parser the parser for transforming the data
     * @returns {this}
     */
    setCandleLoader(inputPath: string, parser?: Parser): this {
        this.candleLoader = new CandleLoader(inputPath, parser);

        return this;
    }

    async start(): Promise<void> {
        await super.start();

        if (!this.candleLoader) {
            throw new Error("No candle loader defined.");
        }

        if (!this.eventsBound) {
            this.subscribeToExchangeEvents(this.strategyConfigurations);

            this.strategyConfigurations.forEach(c => {
                const strategy = new c.strategy(c.pair, this.exchange);
                this.bindStrategyToExchange(strategy);
                this.bindExchangeToStrategy(strategy);
                this.bindExchangeToSocketServer();
            });

            this.eventsBound = true;
        }

        const candles: ICandle[] = (await this.candleLoader.parse()).toArray();
        if (this.webServer) {
            await BackTester.createCache();
            await BackTester.clearCache();
            await this.writeCandleCache(candles);
        }

        await (this.exchange as LocalExchange).emitCandles(candles);
    }

    private static async clearCache(): Promise<void> {
        const rmrf = util.promisify(rimraf);
        await rmrf(`${BackTester.CACHE_FOLDER}/*`);
    }

    private static async createCache(): Promise<void> {
        const mkdir = util.promisify(mkdirp);
        await mkdir(BackTester.CACHE_FOLDER);
    }

    private bindExchangeToSocketServer() {
        this.exchange.on("app.report", (order: IOrder) => this.sendToWebServer("REPORT", order));
    }

    private writeCandleCache(candles: ICandle[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const fileName = generate(`${lowercase}${uppercase}${numbers}`, 6);
            const cacheFile = path.resolve(BackTester.CACHE_FOLDER, `${fileName}.json`);

            const response = JSON.stringify({type: "CANDLES", payload: {pair: "", candles}});
            fs.writeFile(cacheFile, response, err => {
                if (err) return reject(err);

                this.sendToWebServer("CANDLE_FILE", cacheFile);
                resolve(cacheFile);
            });
        });

    }
}
