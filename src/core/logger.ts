import moment from "moment";
import {createLogger, format, transports} from "winston";
const defaults = {silent: process.env.NODE_ENV === "test"};

const stringFormat = format.printf((info) => {
    const {timestamp, level, message, ...args} = info;
    const ts = moment(timestamp).format("YYYY-MM-DD HH:mm:ss")
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`;
});

const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    stringFormat,
);

const fileFormat = format.combine(consoleFormat, format.uncolorize());

const errorLogger = createLogger({
    levels: {error: 3},
    transports: [
        new transports.File({
            ...defaults,
            filename: "./src/logs/error.log",
            format: fileFormat,
            level: "error",
        }),
        new transports.Console({...defaults, format: consoleFormat, level: "error"}),
    ],
});

const infoLogger = createLogger({
    levels: {info: 2},
    transports: [
        new transports.File({
            ...defaults,
            filename: "./src/logs/system.log",
            format: fileFormat,
            level: "info",
        }),
        new transports.Console({...defaults, format: consoleFormat, level: "info"}),
    ],
});

const debugLogger = createLogger({
    levels: {debug: 1},
    transports: [
        new transports.File({
            ...defaults,
            filename: "./src/logs/debug.log",
            format: fileFormat,
            level: "debug",
        }),
    ],
});

const inputLogger = createLogger({
    levels: {input: 0},
    transports: [
        new transports.File({filename: "./src/logs/input.log", level: "input", format: fileFormat}),
    ],
});

export default {
    debug: (msg: string, ...meta: any[]) => debugLogger.debug(msg, meta),
    error: (msg: string, ...meta: any[]) => errorLogger.error(msg, meta),
    info: (msg: string, ...meta: any[]) => infoLogger.info(msg, meta),
    input: (msg: string, ...meta: any[]) => inputLogger.input(msg, meta),
};
