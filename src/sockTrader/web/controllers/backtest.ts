import chokidar, {FSWatcher} from "chokidar";
import path from "path";
import {Socket} from "socket.io";
import BacktestCreator, {IBacktestOptions} from "../backtest/backtestCreator";

/**
 * Path to entry script relative to current folder
 */
const BASE_PATH = "../../../";

/**
 * Name of entry script
 */
const BACKTEST_SCRIPT = "index.js";

/**
 * Name of strategies folder
 */
const STRATEGIES_FOLDER = "strategies";

const creator: BacktestCreator = new BacktestCreator();
let fileWatch: FSWatcher;

export function resolvePath(p: string[] | string): string {
    const args = (typeof p === "string") ? [p] : p;
    return path.resolve(__dirname, BASE_PATH, ...args);
}

export default (socket: Socket) => {

    const scriptPath = resolvePath(BACKTEST_SCRIPT);
    const spawnProcess = (options: IBacktestOptions) => {
        const curProcess = creator.create(scriptPath, options);

        curProcess.on("message", event => {
            if (!event || !event.type) throw new Error("Event is not correct. Expecting: { type: string, payload: any }");

            socket.emit(event.type, event.payload);
        });

        curProcess.on("exit", (code, signal) => socket.emit("process_end", {code, signal}));
        curProcess.on("error", msg => socket.emit("process_error", {msg}));

        socket.emit("process_start", {processId: process.pid});
    };

    socket.on("new_backtest", ({candleFile, strategyFile}) => {
        const watch = true;

        const candles = Buffer.from(candleFile, "base64").toString();
        const strategy = Buffer.from(strategyFile, "base64").toString();

        spawnProcess({candlePath: candles, strategyPath: strategy});

        if (watch) {
            const strategyFilePath = resolvePath([STRATEGIES_FOLDER, strategy + ".js"]);
            console.log("watching: ", strategyFilePath);

            if (typeof fileWatch !== "undefined") fileWatch.removeAllListeners();
            fileWatch = chokidar.watch(strategyFilePath);
            fileWatch.on("change", () => spawnProcess({candlePath: candles, strategyPath: strategy}));
        }
    });
};
