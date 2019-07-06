/* tslint:disable */
import "jest";
import BacktestCreator from "../../sockTrader/web/backtest/backtestCreator";
import stream from "stream";

jest.mock("child_process");

describe("createProcess", () => {
    test("Should fork a new child process and pipe stdOut", async () => {
        const cp = BacktestCreator["createProcess"]("./DOESNT_EXIST.js", {
            candlePath: "FAKE_CANDLE_PATH",
            strategyPath: "FAKE_STRATEGY_PATH",
        });

        const cpMock = jest.requireMock("child_process");
        expect(cpMock.fork.mock.calls[0]).toEqual([
            "./DOESNT_EXIST.js",
            ["--candles=FAKE_CANDLE_PATH", "--strategy=FAKE_STRATEGY_PATH"],
            {stdio: ["ipc"]},
        ]);

        const pipe = (cp.stdout as any).pipe;
        expect(pipe).toBeCalledTimes(1);
        expect(pipe).toHaveBeenLastCalledWith(expect.any(stream.Writable));
    });

    test("Should kill previous process", async () => {
        const prevProcess = jest.requireMock("child_process");

        BacktestCreator["createProcess"] = jest.fn();
        const creator = new BacktestCreator();
        creator.process = prevProcess;
        creator.create("./DOESNT_EXIST.js", {
            candlePath: "FAKE_CANDLE_PATH",
            strategyPath: "FAKE_STRATEGY_PATH",
        });

        expect(prevProcess.removeAllListeners).toBeCalledTimes(1);
        expect(prevProcess.kill).toBeCalledTimes(1);
        expect(prevProcess.kill).toHaveBeenLastCalledWith("SIGKILL");

        (expect(BacktestCreator["createProcess"]) as any).mock.calls[0].toEqual([
            "./DOESNT_EXIST.js",
            {"candlePath": "FAKE_CANDLE_PATH", "strategyPath": "FAKE_STRATEGY_PATH"},
        ]);
    });
});
