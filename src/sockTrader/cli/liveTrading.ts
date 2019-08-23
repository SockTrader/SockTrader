import inquirer from "inquirer";
import LiveTrader from "../core/bot/liveTrader";
import {exchanges} from "../core/exchanges";
import {IExchange} from "../core/types/IExchange";
import {getExchangeInterval, loadStrategy} from "./util";

export async function askForConfirmation(): Promise<boolean> {
    const {confirmation} = await inquirer.prompt([{
        type: "confirm",
        name: "confirmation",
        message: "Know that SockTrader cannot be held responsible for any losses. Are you sure you want to continue?",
    }]);

    return confirmation;
}

function createExchangeByName(exchangeName: string): IExchange {
    const exchange = exchanges[exchangeName];
    if (!exchange) throw new Error(`Could not find exchange: ${exchangeName}`);

    return new exchange.class();
}

export async function startLiveTrading(args: any) {
    const {strategy, pair, paper, exchange, interval, force} = args;
    process.env.SOCKTRADER_TRADING_MODE = paper ? "PAPER" : "LIVE";

    if (!(force || paper)) {
        const isConfirmed = await askForConfirmation();
        if (!isConfirmed) return console.log("We just saved you a few bucks. No harm is done, thank me later ;-)");
        console.log("Enjoy trading! Hold on while we're preparing for a LIVE trading session.");
    }

    try {
        const {default: strategyFile} = await loadStrategy(strategy);

        const liveTrader = new LiveTrader()
            .setExchange(createExchangeByName(exchange))
            .addStrategy({
                strategy: strategyFile,
                pair: [pair[0].toUpperCase(), pair[1].toUpperCase()],
                interval: getExchangeInterval(exchange, interval),
            });

        await liveTrader.start();
    } catch (e) {
        console.error(e);
    }
}
