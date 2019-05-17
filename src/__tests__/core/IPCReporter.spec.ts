/* tslint:disable */
import "jest";
import IPCReporter from "../../sockTrader/core/reporters/IPCReporter";
import moment from "moment";
import {OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../../sockTrader/core/types/order";

describe("IPC Reporter", () => {
    test("Should forward bot progress events via IPC", async () => {
        const mockSend = IPCReporter["send"] = jest.fn(() => true);
        const reporter = new IPCReporter();
        await reporter.reportBotProgress({current: 10, length: 100, type: "progress"});

        expect(mockSend.mock.calls[0]).toEqual([{
            type: "status_report",
            payload: {current: 10, length: 100, type: "progress"},
        }]);
    });

    test("Should forward order events via IPC", async () => {
        const mockSend = IPCReporter["send"] = jest.fn(() => true);
        const reporter = new IPCReporter();
        await reporter.reportOrder({
            createdAt: moment(),
            id: "Order123",
            pair: ["BTC", "USD"],
            price: 1000,
            quantity: 1,
            reportType: ReportType.NEW,
            side: OrderSide.BUY,
            status: OrderStatus.NEW,
            timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
            type: OrderType.LIMIT,
            updatedAt: moment(),
        });

        expect(mockSend).toBeCalledWith(expect.objectContaining({
            type: "order_report",
            payload: {
                pair: ["BTC", "USD"],
                id: "Order123",
                price: 1000,
                quantity: 1,
                reportType: ReportType.NEW,
                side: OrderSide.BUY,
                status: OrderStatus.NEW,
                timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
                type: OrderType.LIMIT,
                updatedAt: expect.any(moment),
                createdAt: expect.any(moment),
            },
        }));
    });
});
