import {ChildProcess, fork} from "child_process";

/**
 * Configuration for backtest process
 */
export interface IBacktestOptions {
    candlePath: string;
    strategyPath: string;
}

export default class BacktestCreator {

    /**
     * Only 1 concurrent process allowed
     * Multiple attempts will kill the previous instance
     */
    process: ChildProcess | undefined;

    create(scriptPath: string, options: IBacktestOptions) {
        if (typeof this.process !== "undefined") {
            this.process.removeAllListeners();
            this.process.kill("SIGKILL");
        }

        this.process = BacktestCreator.createProcess(scriptPath, options);
        return this.process;
    }

    /**
     * Creates a new backtest process
     * @param scriptPath
     * @param options
     */
    private static createProcess(scriptPath: string, options: IBacktestOptions): ChildProcess {
        const childProcess: ChildProcess = fork(`${scriptPath}`, [
            "backtest",
            "--candles", options.candlePath,
            "--strategy", options.strategyPath,
        ], {stdio: ["ipc"]});

        if (childProcess.stdout) childProcess.stdout.pipe(process.stdout);

        return childProcess;
    }
}
