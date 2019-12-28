import winston, {format} from "winston";

const logFormat = format.combine(
    format.timestamp(),
    format.printf(({timestamp, level, message, ...args}) => {
        const rest = Object.keys(args).length ? JSON.stringify(args, undefined, 2) : "";
        return `${timestamp}${getContext(level)}${message} ${rest}`;
    }),
);

function getContext(level: string) {
    const colorizer = winston.format.colorize();
    switch (process.env.SOCKTRADER_TRADING_MODE) {
        case "BACKTEST":
            return colorizer.colorize(level, " [BT] ");
        case "PAPER":
            return colorizer.colorize(level, " [PT] ");
        case "LIVE":
            return colorizer.colorize(level, " [LIVE] ");
        default :
            return " ";
    }
}

function createLogger(category: string): winston.Logger {
    const isTest = process.env.NODE_ENV === "test";
    return winston.loggers.add(category, {
        format: logFormat,
        transports: [
            new winston.transports.Console({silent: isTest}),
            new winston.transports.File({filename: `./src/logs/${category}.log`, silent: isTest}),
        ],
        exceptionHandlers: [
            new winston.transports.File({filename: `./src/logs/error.log`, silent: isTest}),
        ],
        exitOnError: false,
    });
}

export const orderbookLogger = createLogger("orderbook");
export const walletLogger = createLogger("wallet");
export const candleLogger = createLogger("candle");
export const orderLogger = createLogger("order");

export default createLogger("app");
