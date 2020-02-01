import chokidar, {FSWatcher} from "chokidar";
import path from "path";
import {Socket} from "socket.io";
import BacktestProcessFactory, {BacktestOptions} from "../backtest/backtestProcessFactory";

export default class BacktestController {

    private fileWatch?: FSWatcher;
    private readonly backtestScript = "index.js"; // Name of entry script
    private readonly strategiesFolder = "strategies";
    private readonly spawn: (options: BacktestOptions) => void;

    constructor(private socket: Socket) {
        this.spawn = this.getBacktestProcessSpawner(socket, this.resolvePath(this.backtestScript));
    }

    onNewBacktest() {
        this.socket.on("new_backtest", ({candleFile, strategyFile, watch}) => {
            const candleFileName = Buffer.from(candleFile, "base64").toString();
            const strategyFileName = Buffer.from(strategyFile, "base64").toString();

            this.spawn({candlePath: candleFileName, strategyPath: strategyFileName});

            if (watch) this.watchStrategyFile(candleFileName, strategyFileName, this.spawn);
        });
    }

    private getBacktestProcessSpawner(socket: Socket, scriptPath: string) {
        return (options: BacktestOptions) => {
            const backtestProcess = new BacktestProcessFactory().create(scriptPath, options);

            backtestProcess.on("message", (event: {type?: string; payload?: any}) => {
                if (!event || !event.type) throw new Error("Event is not correct. Expecting: { type: string, payload: any }");

                socket.emit(event.type, event.payload);
            });

            backtestProcess.on("exit", (code, signal) => socket.emit("process_end", {code, signal}));
            backtestProcess.on("error", msg => socket.emit("process_error", {msg}));

            socket.emit("process_start", {processId: process.pid});
        };
    }

    private watchStrategyFile(candleFileName: string, strategyFileName: string, onChange: (opts: BacktestOptions) => void) {
        const strategyFilePath = this.resolvePath([this.strategiesFolder, strategyFileName + ".js"]);
        console.log("watching: ", strategyFilePath);

        if (typeof this.fileWatch !== "undefined") this.fileWatch.removeAllListeners();
        this.fileWatch = chokidar.watch(strategyFilePath);
        this.fileWatch.on("change", () => onChange({candlePath: candleFileName, strategyPath: strategyFileName}));
    }

    private resolvePath(p: string[] | string): string {
        const args = (typeof p === "string") ? [p] : p;
        return path.resolve(__dirname, "../../../", ...args);
    }
}
