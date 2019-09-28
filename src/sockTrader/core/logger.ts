import moment from "moment";
import winston, {format} from "winston";

const colorizer = winston.format.colorize();
const silent = process.env.NODE_ENV === "test";

function getContext(level: string) {
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

const logger = winston.createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.printf(info => {
            const {timestamp, level, message, ...args} = info;
            const ts = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
            return `${ts}${getContext(level)}${message} ${Object.keys(args).length ? JSON.stringify(args, undefined, 2) : ""}`;
        }),
    ),
    transports: [
        new winston.transports.Console({silent}),
        new winston.transports.File({filename: "./src/logs/error.log", level: "error", silent}),
    ],
});

export default logger;
