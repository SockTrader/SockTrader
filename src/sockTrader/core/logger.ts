import winston, {format} from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

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

function createLogger(category: string, dailyRotate = false): winston.Logger {
    const silent = process.env.NODE_ENV === "test";
    return winston.loggers.add(category, {
        format: logFormat,
        transports: [
            new winston.transports.Console({silent}),
            !dailyRotate
                ? new winston.transports.File({filename: `./src/logs/${category}.log`, silent})
                : new DailyRotateFile({
                    filename: `${category}-%DATE%.log`,
                    dirname: "./src/logs",
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: true,
                    createSymlink: true,
                    symlinkName: `current-${category}.log`,
                    maxFiles: "14d",
                    silent,
                }),
        ],
    });
}

export const orderbookLogger = createLogger("orderbook", true);
export const walletLogger = createLogger("wallet");
export const candleLogger = createLogger("candle");
export const orderLogger = createLogger("order");

export default createLogger("app");
