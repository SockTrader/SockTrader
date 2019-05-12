import "jest";
import backtestWSEventHandler, {resolvePath} from "../../sockTrader/web/controllers/backtest";
import backtestCreator from "../../sockTrader/web/backtest/backtestCreator";
import {EventEmitter} from "events";
import {Socket} from "socket.io";
import chokidar from "chokidar";

const processMock = new EventEmitter();

jest.mock("chokidar", () => ({
    watch: jest.fn(() => new EventEmitter()),
}));

jest.mock("../../sockTrader/web/backtest/backtestCreator", () => {
    function Mock() {
    }

    Mock.prototype = Object.create(jest.requireActual("events"));
    Mock.prototype.create = jest.fn(() => processMock);

    return Mock;
});

describe("Path resolve utility", () => {
    expect(resolvePath("backtest.js")).toContain("src/backtest.js");
    expect(resolvePath(["sockTrader", "backtest.js"])).toContain("src/sockTrader/backtest.js");
});

describe("Web-based backtest process creator", () => {
    let socket = new EventEmitter();

    beforeEach(() => {
        socket = new EventEmitter();
        backtestWSEventHandler(socket as Socket);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const startBackTest = () => {
        socket.emit("new_backtest", {
            candleFile: Buffer.from("CANDLES").toString("base64"),
            strategyFile: Buffer.from("STRATEGY").toString("base64"),
        });
    };

    test("Should start a new backtest process when it receives an \"new_backtest\" event", () => {
        startBackTest();
        expect(backtestCreator.prototype.create).toHaveBeenLastCalledWith(
            expect.stringContaining("src/backtest.js"),
            {"candlePath": "CANDLES", "strategyPath": "STRATEGY"},
        );
    });

    test("Should forward events from backtest process to frontend", () => {
        startBackTest();

        socket.once("MY_TEST", (payload) => expect(payload).toEqual("sample payload"));
        socket.once("process_error", (payload) => expect(payload).toEqual({msg: "Something went wrong"}));
        socket.once("process_end", (error) => expect(error).toEqual({code: 9, signal: "SIGKILL"}));

        processMock.emit("message", {type: "MY_TEST", payload: "sample payload"});
        processMock.emit("error", "Something went wrong");
        processMock.emit("exit", 9, "SIGKILL");
    });

    test("Socket should receive an \"process_start\" event when process has started", () => {
        socket.once("process_start", ({processId}) => expect(typeof processId).toBe("number"));
        startBackTest();
    });
});
