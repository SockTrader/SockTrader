import winston, {format} from "winston";

const IS_TEST = process.env.NODE_ENV === "test";
const logFormat = format.combine(
    format.timestamp(),
    format.printf(({timestamp, message}) => {
        const {type, payload, ...rest} = message as any;
        const data = (payload) ? payload : rest;
        return `${timestamp} ${getContext()} ${JSON.stringify({type, payload: data})}`;
    }),
);

function getContext() {
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

function createLogger(category: string): winston.Logger {
    return winston.loggers.add(category, {
        format: logFormat,
        exitOnError: false,
        transports: [
            new winston.transports.Console({silent: IS_TEST}),
            new winston.transports.File({filename: `./src/logs/${category}.log`, silent: IS_TEST}),
        ],
    });
}

export const orderbookLogger = createLogger("orderbook");
export const walletLogger = createLogger("wallet");
export const candleLogger = createLogger("candle");
export const orderLogger = createLogger("order");

export default createLogger("app")
    .add(new winston.transports.File({
        filename: `./src/logs/error.log`,
        silent: IS_TEST,
        handleExceptions: true,
    }));
