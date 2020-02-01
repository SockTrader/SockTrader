import {EventEmitter} from "events";
import {Socket} from "socket.io";
import BacktestController from "../../../sockTrader/web/controllers/backtestController";
import BacktestProcessFactory from "../../../sockTrader/web/backtest/backtestProcessFactory";

jest.mock("../../../sockTrader/web/backtest/backtestProcessFactory");

let socket: EventEmitter;
let controller: BacktestController;

beforeEach(() => {
    jest.clearAllMocks();
    socket = new EventEmitter();
    controller = new BacktestController(socket as Socket);
});

describe("constructor", () => {
    it("Should create a spawner when initialized", () => {
        const spy = jest.spyOn(BacktestController.prototype, "getBacktestProcessSpawner" as any);

        socket = new EventEmitter();
        controller = new BacktestController(socket as Socket);

        expect(spy).toBeCalledWith(socket, expect.stringContaining("src/index.js"));
    });
});

describe("onNewBacktest", () => {
    const emitNewBacktest = (args?: any) => {
        socket.emit("new_backtest", {
            candleFile: Buffer.from("CANDLES").toString("base64"),
            strategyFile: Buffer.from("STRATEGY").toString("base64"),
            watch: false,
            ...args,
        });
    };

    it("Should listen to \"new_backtest\" events", () => {
        const spy = jest.spyOn(socket, "on");
        controller.onNewBacktest();

        expect(spy).toBeCalledWith("new_backtest", expect.any(Function));
    });

    it("Should spawn new process when \"new_backtest\" event received", () => {
        (controller as any)["spawn"] = jest.fn();
        controller.onNewBacktest();

        emitNewBacktest();

        expect(controller["spawn"]).toBeCalledWith({candlePath: "CANDLES", strategyPath: "STRATEGY"});
    });

    it("Should NOT watch strategy file if watch parameter is FALSE", () => {
        (controller as any)["spawn"] = jest.fn();
        controller["watchStrategyFile"] = jest.fn();
        controller.onNewBacktest();

        emitNewBacktest({watch: false});

        expect(controller["watchStrategyFile"]).toBeCalledTimes(0);
    });

    it("Should watch strategy file if watch parameter is TRUE", () => {
        (controller as any)["spawn"] = jest.fn();
        controller["watchStrategyFile"] = jest.fn();
        controller.onNewBacktest();

        emitNewBacktest({watch: true});

        expect(controller["watchStrategyFile"]).toBeCalledWith("CANDLES", "STRATEGY", controller["spawn"]);
    });
});

describe("getBacktestProcessSpawner", () => {
    let emitSpy: any;
    let process: any;
    beforeEach(() => {
        emitSpy = jest.spyOn(socket, "emit");
        process = (BacktestProcessFactory as any).__getProcess();
        controller["spawn"]({candlePath: "CANDLE_FILE", strategyPath: "simpleMovingAverage"});
    });

    it("Should throw if message from backtest process is incorrect", () => {
        expect(() => process.emit("message")).toThrowError("Event is not correct. Expecting: { type: string, payload: any }");
        expect(() => process.emit("message", {})).toThrowError("Event is not correct. Expecting: { type: string, payload: any }");
    });

    it("Should forward messages from backtest process to socket", () => {
        process.emit("message", {type: "test", payload: "payload"});
        expect(emitSpy).toBeCalledWith("test", "payload");
    });

    it("Should tell socket that a new process has been started", () => {
        expect(emitSpy).toBeCalledWith("process_start", expect.objectContaining({processId: expect.any(Number)}));
    });

    it("Should tell socket that a process has been exited", () => {
        process.emit("exit", "code", "signal");
        expect(emitSpy).toBeCalledWith("process_end", {code: "code", signal: "signal"});
    });

    it("Should tell socket when an error has occurred in the child process", () => {
        process.emit("error", "something went wrong");
        expect(emitSpy).toBeCalledWith("process_error", {msg: "something went wrong"});
    });
});

describe("watchStrategyFile", () => {
    const chokidar = require("chokidar");
    beforeEach(() => jest.spyOn(console, "log").mockImplementation());

    it("Should trigger onChange callback when a strategy file changed", () => {
        const callback = jest.fn();
        controller["watchStrategyFile"]("CANDLE_FILE", "simpleMovingAverage", callback);

        chokidar.__triggerChange();

        expect(callback).toBeCalledWith({candlePath: "CANDLE_FILE", strategyPath: "simpleMovingAverage"});
    });

    it("Should watch for strategy changes", () => {
        controller["watchStrategyFile"]("CANDLE_FILE", "simpleMovingAverage", jest.fn());
        expect(chokidar.watch).toBeCalledWith(expect.stringContaining("src/strategies/simpleMovingAverage.js"));
    });

    it("Should prevent memory leaks", () => {
        const spy = jest.spyOn(chokidar.__getWatcher(), "removeAllListeners");
        controller["watchStrategyFile"]("CANDLE_FILE", "simpleMovingAverage", jest.fn());
        controller["watchStrategyFile"]("CANDLE_FILE", "simpleMovingAverage", jest.fn());
        expect(spy).toBeCalledTimes(1);
    });
});

describe("resolvePath", () => {
    it("Should resolve file name to absolute path", () => {
        expect(controller["resolvePath"]("backtest.js")).toContain("src/backtest.js");
    });

    it("Should resolve file name with direct parent directory to absolute path", () => {
        expect(controller["resolvePath"](["sockTrader", "backtest.js"])).toContain("src/sockTrader/backtest.js");
    });
});
