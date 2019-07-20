import {EventEmitter} from "events";

module.exports = jest.fn((...args) => {
    const ws = new EventEmitter();

    (ws as any).terminate = jest.fn(() => ws.emit("close", 101, "Connection terminated"));
    (ws as any).ping = jest.fn((...pingArgs: any[]) => ws.emit("ping", ...pingArgs));

    return ws;
});
