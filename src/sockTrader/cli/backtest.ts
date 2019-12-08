import config from "../../config";
import BackTester from "../core/bot/backTester";
import IPCReporter from "../core/plugins/IPCReporter";
import WalletFactory from "../core/plugins/wallet/walletFactory";
import {loadCandleFile, loadStrategy} from "./util";

export async function startBacktest(args: any) {
    process.env.SOCKTRADER_TRADING_MODE = "BACKTEST";
    const {candles: candleFilename, strategy: strategyFilename} = args;

    try {
        const {default: strategy} = await loadStrategy(strategyFilename);
        const {default: candleFile} = await loadCandleFile(candleFilename);

        const backTester = new BackTester(candleFile.candles)
            .addStrategy({
                strategy,
                pair: candleFile.symbol,
            });

        backTester.setPlugins([...config.plugins, new IPCReporter(), WalletFactory.getInstance()]);

        await backTester.start();
    } catch (e) {
        console.error(e);
    }
}
