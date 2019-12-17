import inquirer from "inquirer";
import config from "../../config";
import LiveTrader from "../core/bot/liveTrader";
import BaseExchange from "../core/exchanges/baseExchange";
import ExchangeFactory from "../core/exchanges/exchangeFactory";
import WalletFactory from "../core/plugins/wallet/walletFactory";
import {getExchangeInterval, loadStrategy} from "./util";

export default class LiveTrading {
    private readonly paper: boolean;
    private readonly force: boolean;
    private readonly exchange: string;
    private readonly pair: [string, string];
    private readonly interval: string;
    private readonly strategy: string;

    constructor(args: any) {
        this.paper = args.paper;
        this.force = args.force;
        this.exchange = args.exchange;
        this.pair = args.pair;
        this.interval = args.interval;
        this.strategy = args.strategy;
    }

    async askForConfirmation(): Promise<boolean> {
        const {confirmation} = await inquirer.prompt([{
            type: "confirm",
            name: "confirmation",
            message: "Know that SockTrader cannot be held responsible for any losses. Are you sure you want to continue?",
        }]);

        return confirmation;
    }

    createLiveTrader(exchange: BaseExchange, strategy: any, pair: [string, string]) {
        return new LiveTrader()
            .setExchange(exchange)
            .setPlugins([...config.plugins, WalletFactory.getInstance()])
            .setStrategy({
                strategy,
                pair: [pair[0].toUpperCase(), pair[1].toUpperCase()],
                interval: getExchangeInterval(this.exchange, this.interval),
            });
    }

    async start() {
        process.env.SOCKTRADER_TRADING_MODE = this.paper ? "PAPER" : "LIVE";

        if (!(this.force || this.paper)) {
            const isConfirmed = await this.askForConfirmation();
            if (!isConfirmed) return console.log("We just saved you a few bucks. No harm is done, thank me later ;-)");
            console.log("Enjoy trading! Hold on while we're preparing for a LIVE trading session.");
        }

        try {
            const {default: strategyFile} = await loadStrategy(this.strategy);
            const exchange = new ExchangeFactory().createExchange(this.exchange);

            const liveTrader = this.createLiveTrader(exchange, strategyFile, this.pair);
            await liveTrader.start();
        } catch (e) {
            console.error(e);
        }
    }
}
