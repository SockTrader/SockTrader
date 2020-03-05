import {ChildProcess, fork} from "child_process";

/**
 * Configuration for backtest process
 */
export interface BacktestOptions {
    candlePath: string;
    strategyPath: string;
}

export default class BacktestProcessFactory {

    /**
     * Only 1 concurrent process allowed
     * Multiple attempts will kill the previous instance
     */
    process?: ChildProcess;

    create(scriptPath: string, options: BacktestOptions) {
        if (typeof this.process !== "undefined") {
            this.process.removeAllListeners();
            this.process.kill("SIGKILL");
        }

        this.process = BacktestProcessFactory.createProcess(scriptPath, options);
        return this.process;
    }

    /**
     * Creates a new backtest process
     * @param scriptPath
     * @param options
     */
    private static createProcess(scriptPath: string, options: BacktestOptions): ChildProcess {
        const childProcess: ChildProcess = fork(`${scriptPath}`, [
            "backtest",
            "--candles", options.candlePath,
            "--strategy", options.strategyPath,
        ], {stdio: ["ipc"]});

        if (childProcess.stdout) childProcess.stdout.pipe(process.stdout);
        if (childProcess.stderr) childProcess.stderr.pipe(process.stderr);

        return childProcess;
    }
}
