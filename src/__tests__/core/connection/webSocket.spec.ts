import WsConnection from "../../../sockTrader/core/connection/wsConnection";
import logger from "../../../sockTrader/core/loggerFactory";
import ws from "ws";
import HitBTCCommand from "../../../sockTrader/core/exchange/commands/hitBTCCommand";
import {Command} from "../../../sockTrader/core/types/connection";

jest.mock("ws");
jest.mock("../../../sockTrader/core/loggerFactory");

let websocket = new WsConnection("wss://api.does_not_exist.com/api/2/ws", 10000);
beforeEach(() => {
    websocket = new WsConnection("wss://api.does_not_exist.com/api/2/ws", 10000);
    jest.clearAllMocks();
});

describe("connect", () => {
    it("Should connect to a websocket remote", () => {
        websocket.connect();
        expect((ws as any).mock.calls[0]).toEqual(["wss://api.does_not_exist.com/api/2/ws", {perMessageDeflate: false}]);
    });

    it("Should call onClose when a connection is closed", () => {
        const spy = jest.spyOn(websocket, "onClose" as any);

        websocket.connect();
        (websocket["connection"] as any).emit("close", 100, "running a unit test");

        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0]).toEqual([100, "running a unit test"]);
    });

    it("Should call onOpen when a connection is opened", () => {
        const spy = jest.spyOn(websocket, "onOpen" as any);

        websocket.connect();
        (websocket["connection"] as any).emit("open");

        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0]).toEqual([]);
    });

    it("Should call onPing when a ping message has been received", () => {
        const spy = jest.spyOn(websocket, "onPing" as any);

        websocket.connect();
        (websocket["connection"] as any).emit("ping");

        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0]).toEqual([]);
    });

    it("Should call onPong when a pong message has been received", () => {
        const spy = jest.spyOn(websocket, "onPong" as any);

        websocket.connect();
        (websocket["connection"] as any).emit("pong");

        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0]).toEqual([]);
    });

    it("Should call onError when an error event has occurred", () => {
        const spy = jest.spyOn(websocket, "onError" as any);

        websocket.connect();
        (websocket["connection"] as any).emit("error", new Error("running a unit test"));

        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0]).toEqual([new Error("running a unit test")]);
    });

    it("Should call onMessage when a message event has been received", () => {
        const spy = jest.spyOn(websocket, "onMessage" as any);

        websocket.connect();
        (websocket["connection"] as any).emit("message", JSON.stringify({msg: "unit test"}));

        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0]).toEqual([JSON.stringify({msg: "unit test"})]);
    });

    it("Should log unexpected-response events when they occur", () => {
        websocket.connect();
        (websocket["connection"] as any).emit("unexpected-response");

        expect(logger.info).toBeCalledTimes(1);
        expect((logger.info as any).mock.calls[0]).toEqual(["Unexpected response"]);
    });
});

describe("waitForTermination", () => {

    beforeEach(() => jest.useFakeTimers());

    it("Should terminate the connection if timeout expires", () => {
        websocket.connect();

        const spy = jest.spyOn(websocket["connection"] as any, "terminate");

        // @ts-ignore
        websocket.waitForTermination();
        jest.runAllTimers();

        expect(spy).toBeCalledTimes(1);
        expect(spy.mock.calls[0]).toEqual([]);
    });
});

describe("heartbeat", () => {

    beforeEach(() => jest.useFakeTimers());

    it("Should reset timeout, each time its called", () => {
        websocket.connect();

        const spy = jest.spyOn(global, "clearTimeout");

        websocket["heartbeat"]();
        websocket["heartbeat"]();

        expect(spy).toBeCalledTimes(1);
        expect(spy).toBeCalledWith(expect.objectContaining({
            id: expect.any(Number),
            ref: expect.any(Function),
            unref: expect.any(Function),
        }));
    });

    it("Should ping remote when timeout passed", () => {
        websocket.connect();

        const spyPing = jest.spyOn(websocket["connection"] as any, "ping");
        const spyTermination = jest.spyOn(websocket as any, "waitForTermination");

        websocket["heartbeat"]();
        jest.runAllTimers();

        expect(websocket["isExpectingPong"]).toEqual(true);
        expect((logger.info as any)).toBeCalledWith("No response received from exchange within 11s.");
        expect(spyPing).toBeCalledWith("is_target_online");
        expect(spyTermination).toBeCalledTimes(1);
    });
});

describe("onPing", () => {
    it("Should trigger heartbeat", () => {
        const spyHeartbeat = jest.spyOn(websocket, "heartbeat" as any);
        websocket["onPing"]();

        expect(spyHeartbeat).toBeCalledTimes(1);
    });
});

describe("onPong", () => {
    it("Should trigger heartbeat if we're expecting a pong", () => {
        const spyHeartbeat = jest.spyOn(websocket, "heartbeat" as any);

        websocket["isExpectingPong"] = true;
        websocket["onPong"]();

        expect(spyHeartbeat).toBeCalledTimes(1);
    });
});

describe("addRestorable", () => {
    it("Should have an empty list when created", () => {
        expect(websocket["restoreCommands"]).toEqual([]);
    });

    it("Should save commands for later usage", () => {
        websocket.addRestorable(HitBTCCommand.createRestorable("login"));

        const command: Command = websocket["restoreCommands"][0];
        expect(command).toBeInstanceOf(HitBTCCommand);
        expect(command.toCommand()).toEqual({id: "login", method: "login", params: {}});
    });
});

describe("send", () => {
    it("Should log error when connection is not available", () => {
        websocket.send({} as Command);
        expect((logger.error as any)).toBeCalledWith("Could not send: {}. No connection available.");
    });

    it("Should send a command using the connection", () => {
        websocket["connection"] = {send: jest.fn()} as any;

        websocket.send(new HitBTCCommand("login"));
        expect((websocket["connection"] as any)["send"]).toBeCalledWith("{\"method\":\"login\",\"params\":{},\"id\":\"login\"}");
    });
});
