import {ChildProcess, fork} from "child_process";
import path from "path";
import {Socket} from "socket.io";

const BASE_PATH = "../../../";

export default (socket: Socket) => {
    socket.on("new_backtest", ({candleFile, strategyFile}) => {

        const candlePath = Buffer.from(candleFile, "base64").toString();
        const strategyPath = Buffer.from(strategyFile, "base64").toString();
        const scriptPath = path.resolve(__dirname, BASE_PATH, "backtest.js");

        const backtestProcess: ChildProcess = fork(scriptPath, [
            `--candles=${candlePath}`,
            `--strategy=${strategyPath}`,
        ], {stdio: ["ipc"]});

        backtestProcess.stdout.pipe(process.stdout);

        backtestProcess.on("message", event => {
            if (!event.type) {
                throw new Error("Event type is not correct. Expecting: { type: string, payload: any }");
            }

            socket.emit("backtest_order", event);
        });

        backtestProcess.on("exit", (code, signal) => {
            console.log("WebServer script exit: ", {code, signal});
        });

        backtestProcess.on("error", msg => {
            console.log("WebServer script error: ", msg);
        });

        socket.emit("backtest_start", {processId: process.pid});
    });
};
