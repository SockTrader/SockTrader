import BacktestProcessFactory from "../../sockTrader/web/backtest/backtestProcessFactory";
import stream from "stream";

jest.mock("child_process");

describe("createProcess", () => {
    it("Should fork a new child process and pipe stdOut", async () => {
        const cp = BacktestProcessFactory["createProcess"]("./DOESNT_EXIST.js", {
            candlePath: "FAKE_CANDLE_PATH",
            strategyPath: "FAKE_STRATEGY_PATH",
        });

        const cpMock = jest.requireMock("child_process");
        expect(cpMock.fork.mock.calls[0]).toEqual([
            "./DOESNT_EXIST.js",
            ["backtest",
                "--candles", "FAKE_CANDLE_PATH",
                "--strategy", "FAKE_STRATEGY_PATH"],
            {stdio: ["ipc"]},
        ]);

        const pipe = (cp.stdout as any).pipe;
        expect(pipe).toBeCalledTimes(1);
        expect(pipe).toHaveBeenLastCalledWith(expect.any(stream.Writable));
    });

    it("Should kill previous process", async () => {
        const prevProcess = jest.requireMock("child_process");

        BacktestProcessFactory["createProcess"] = jest.fn();
        const creator = new BacktestProcessFactory();
        creator.process = prevProcess;
        creator.create("./DOESNT_EXIST.js", {
            candlePath: "FAKE_CANDLE_PATH",
            strategyPath: "FAKE_STRATEGY_PATH",
        });

        expect(prevProcess.removeAllListeners).toBeCalledTimes(1);
        expect(prevProcess.kill).toBeCalledTimes(1);
        expect(prevProcess.kill).toHaveBeenLastCalledWith("SIGKILL");

        expect((BacktestProcessFactory["createProcess"] as any).mock.calls[0]).toEqual([
            "./DOESNT_EXIST.js",
            {"candlePath": "FAKE_CANDLE_PATH", "strategyPath": "FAKE_STRATEGY_PATH"},
        ]);
    });
});
