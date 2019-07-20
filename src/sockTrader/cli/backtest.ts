import config from "../../config";
import BackTester from "../core/bot/backTester";
import IPCReporter from "../core/reporters/IPCReporter";
import {loadCandleFile, loadStrategy} from "./util";

export async function startBacktest(args: any) {
    const {candles: candleFilename, strategy: strategyFilename} = args;

    try {
        const {default: strategy} = await loadStrategy(strategyFilename);
        const {default: candleFile} = await loadCandleFile(candleFilename);

        const backTester = new BackTester({assets: config.assets}, candleFile.candles)
            .addStrategy({
                strategy,
                pair: candleFile.symbol,
            });

        if (process.send) backTester.addReporter(new IPCReporter());

        await backTester.start();
    } catch (e) {
        console.error(e);
    }
}
