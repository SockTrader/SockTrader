import config from "../../config";
import BackTester from "../core/bot/backTester";
import IPCReporter from "../core/plugins/IPCReporter";
import {loadCandleFile, loadStrategy} from "./util";

export default class Backtest {
    constructor(private candleFile: string, private strategyFile: string) {
    }

    createBackTester(candleFile: any, strategy: any) {
        return new BackTester(candleFile.candles)
            .setPlugins([...config.plugins, new IPCReporter()])
            .setStrategy({
                strategy,
                pair: candleFile.symbol,
            });
    }

    async start() {
        try {
            process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";

            const {default: strategy} = await loadStrategy(this.strategyFile);
            const {default: candleFile} = await loadCandleFile(this.candleFile);

            const backTester = this.createBackTester(candleFile, strategy);
            await backTester.start();
        } catch (e) {
            console.error(e);
        }
    }
}
