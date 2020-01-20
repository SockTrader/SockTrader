import winston, {format} from "winston";

export class LoggerFactory {

    static IS_TEST = process.env.NODE_ENV === "test";
    private static readonly logFormat = format.combine(
        format.timestamp(),
        format.printf(LoggerFactory.format),
    );

    private static format(info: any) {
        let type = "message";
        let payload = info.message;

        if (typeof info.message === "object" && info.message.constructor === Object) {
            const {type: msgType, payload: msgPayload, ...rest} = info.message;
            type = msgType ? msgType : type;
            payload = msgPayload ? msgPayload : rest;
        }

        return `${info.timestamp} ${LoggerFactory.getContext()} ${JSON.stringify({type, payload})}`;
    }

    private static getContext() {
        switch (process.env.SOCKTRADER_TRADING_MODE) {
            case "BACKTEST":
                return "[BT]";
            case "PAPER":
                return "[PT]";
            case "LIVE":
                return "[LIVE]";
            default :
                return " ";
        }
    }

    static createLogger(category: string): winston.Logger {
        return winston.loggers.add(category, {
            format: this.logFormat,
            exitOnError: false,
            transports: [
                new winston.transports.Console({silent: LoggerFactory.IS_TEST}),
                new winston.transports.File({filename: `./src/logs/${category}.log`, silent: LoggerFactory.IS_TEST}),
            ],
        });
    }
}

export const orderbookLogger = LoggerFactory.createLogger("orderbook");
export const walletLogger = LoggerFactory.createLogger("wallet");
export const candleLogger = LoggerFactory.createLogger("candle");
export const orderLogger = LoggerFactory.createLogger("order");

export default LoggerFactory.createLogger("app")
    .add(new winston.transports.File({
        filename: `./src/logs/error.log`,
        silent: LoggerFactory.IS_TEST,
        handleExceptions: true,
    }));
