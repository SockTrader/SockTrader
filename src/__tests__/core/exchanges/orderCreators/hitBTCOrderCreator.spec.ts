import OrderTracker from "../../../../sockTrader/core/exchanges/utils/orderTracker";
import HitBTCOrderCreator from "../../../../sockTrader/core/exchanges/orderCreators/hitBTCOrderCreator";
import {IOrder, OrderSide, ReportType} from "../../../../sockTrader/core/types/order";
import Local from "../../../../sockTrader/core/connection/local";
import HitBTCCommand from "../../../../sockTrader/core/exchanges/commands/hitBTCCommand";
import moment from "moment";

jest.mock("../../../../sockTrader/core/connection/local");

let hitBTCOrderCreator = new HitBTCOrderCreator(new OrderTracker(), new Local());
beforeEach(() => {
    hitBTCOrderCreator = new HitBTCOrderCreator(new OrderTracker(), new Local());
});

describe("cancelOrder", () => {
    test("Should set cancel order as unconfirmed", () => {
        const order = {reportType: ReportType.NEW, id: "123", pair: ["BTC", "USD"], price: 10, quantity: 1} as IOrder;
        const unconfirmedSpy = jest.spyOn(hitBTCOrderCreator["orderTracker"], "setOrderUnconfirmed");
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.cancelOrder(order);

        expect(unconfirmedSpy).toBeCalledWith("123");
        expect(sendSpy.mock.calls[0][0]).toBeInstanceOf(HitBTCCommand);
        expect(sendSpy).toBeCalledWith({
            method: "cancelOrder",
            params: {clientOrderId: "123"},
            restorable: false,
        });
    });
});

describe("createOrder", () => {
    test("Should create a new order", () => {
        const unconfirmedSpy = jest.spyOn(hitBTCOrderCreator["orderTracker"], "setOrderUnconfirmed");
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.createOrder(["BTC", "USD"], 10, 2, OrderSide.BUY);

        expect(unconfirmedSpy).toBeCalledWith(expect.any(String));
        expect(sendSpy.mock.calls[0][0]).toBeInstanceOf(HitBTCCommand);
        expect(sendSpy).toBeCalledWith({
            method: "newOrder",
            params: {
                clientOrderId: expect.any(String),
                price: 10,
                quantity: 2,
                side: "buy",
                symbol: ["BTC", "USD"],
                type: "limit",
            },
            restorable: false,
        });
    });
});

describe("adjustOrder", () => {
    // @formatter:off
    const order = {id: "123", side: OrderSide.BUY, createdAt: moment(), pair: ["BTC", "USD"], price: 100, quantity: 2} as IOrder;
    // @formatter:on

    test("Should adjust an existing order", () => {
        const unconfirmedSpy = jest.spyOn(hitBTCOrderCreator["orderTracker"], "setOrderUnconfirmed");
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.adjustOrder(order, 10, 1);

        expect(unconfirmedSpy).toBeCalledWith(expect.any(String));
        expect(sendSpy.mock.calls[0][0]).toBeInstanceOf(HitBTCCommand);
        expect(sendSpy).toBeCalledWith({
            method: "cancelReplaceOrder",
            params: {
                clientOrderId: expect.any(String),
                price: 10,
                quantity: 1,
                requestClientId: expect.any(String),
                strictValidate: true,
            },
            restorable: false,
        });
    });

    test("Should not adjust when order is unconfirmed", () => {
        hitBTCOrderCreator["orderTracker"].isOrderUnconfirmed = jest.fn(() => true);
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.adjustOrder(order, 10, 1);

        expect(sendSpy).toBeCalledTimes(0);
    });

    test("Should not adjust when adjusted price & quantity is the same as the original", () => {
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.adjustOrder(order, 100, 2);

        expect(sendSpy).toBeCalledTimes(0);
    });
});
