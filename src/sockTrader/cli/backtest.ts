import config from "../../config";
import BackTester from "../core/bot/backTester";
import {CandleInterval} from "../core/exchanges/hitBTC";
import IPCReporter from "../core/reporters/IPCReporter";
import {loadCandleFile, loadStrategy} from "./util";

export async function backtest(args: any) {
    const {candles: strategyFilename, strategy: candleFilename} = args;

    try {
        const {default: strategy} = await loadStrategy(strategyFilename);
        const {default: candleFile} = await loadCandleFile(candleFilename);

        const backTester = new BackTester({assets: config.assets}, candleFile.candles)
            .addStrategy({
                strategy,
                pair: candleFile.symbol,
                interval: CandleInterval.ONE_HOUR, // @TODO make interval dynamic
            });

        if (process.send) backTester.addReporter(new IPCReporter());

        await backTester.start();
    } catch (e) {
        console.error(e);
    }
}
