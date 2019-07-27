import moment from "moment";
import winston, {format} from "winston";

const silent = process.env.NODE_ENV === "test";
const logger = winston.createLogger({
    level: "info",
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(info => {
            const {timestamp, level, message, ...args} = info;
            const ts = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
            return `${ts} [${level}] ${message} ${Object.keys(args).length ? JSON.stringify(args, undefined, 2) : ""}`;
        }),
    ),
    transports: [
        new winston.transports.Console({silent}),
        new winston.transports.File({filename: "./src/logs/error.log", level: "error", silent}),
    ],
});

export default logger;
