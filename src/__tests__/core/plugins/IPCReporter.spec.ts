import IPCReporter from "../../../sockTrader/core/plugins/IPCReporter";
import {FX_NEW_BUY_ORDER} from "../../../__fixtures__/order";

describe("send", () => {
    it("Should send a message via the IPC channel", () => {
        process.send = jest.fn();

        const reporter = new IPCReporter();
        reporter["send"]({payload: "message", type: "unit_test"});

        expect(process.send).toBeCalledWith({payload: "message", type: "unit_test"});
    });
});

describe("onBotProgress", () => {
    it("Should send bot progress updates via IPC", () => {
        process.send = jest.fn();

        const reporter = new IPCReporter();
        reporter.onBotProgress({current: 100, length: 200, type: "progress"});

        expect(process.send).toBeCalledWith({
            type: "status_report",
            payload: {
                "current": 100,
                "length": 200,
                "type": "progress",
            },
        });
    });
});

describe("onReport", () => {
    it("Should send order reports via IPC", () => {
        process.send = jest.fn();

        const reporter = new IPCReporter();
        reporter.onReport(FX_NEW_BUY_ORDER);

        expect(process.send).toBeCalledWith({
            type: "order_report",
            payload: FX_NEW_BUY_ORDER,
        });
    });
});
