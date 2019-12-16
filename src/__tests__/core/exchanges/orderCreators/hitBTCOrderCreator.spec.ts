import OrderTracker from "../../../../sockTrader/core/order/orderTracker";
import HitBTCOrderCreator from "../../../../sockTrader/core/exchanges/orderCreators/hitBTCOrderCreator";
import {OrderSide} from "../../../../sockTrader/core/types/order";
import LocalConnection from "../../../../sockTrader/core/connection/localConnection";
import HitBTCCommand from "../../../../sockTrader/core/exchanges/commands/hitBTCCommand";
import {FX_NEW_BUY_ORDER} from "../../../../__fixtures__/order";

jest.mock("../../../../sockTrader/core/connection/localConnection");

let hitBTCOrderCreator = new HitBTCOrderCreator(new OrderTracker(), new LocalConnection());
beforeEach(() => {
    hitBTCOrderCreator = new HitBTCOrderCreator(new OrderTracker(), new LocalConnection());
});

describe("cancelOrder", () => {
    it("Should set cancel order as unconfirmed", () => {
        const unconfirmedSpy = jest.spyOn(hitBTCOrderCreator["orderTracker"], "setOrderUnconfirmed");

        hitBTCOrderCreator.cancelOrder(FX_NEW_BUY_ORDER);

        expect(unconfirmedSpy).toBeCalledWith("NEW_BUY_ORDER_1");
    });

    it("Should send cancel command to connection", () => {
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.cancelOrder(FX_NEW_BUY_ORDER);

        expect(sendSpy.mock.calls[0][0]).toBeInstanceOf(HitBTCCommand);
        expect(sendSpy).toBeCalledWith({
            method: "cancelOrder",
            params: {clientOrderId: "NEW_BUY_ORDER_1"},
            restorable: false,
        });
    });
});

describe("createOrder", () => {
    it("Should set new order as unconfirmed", () => {
        const unconfirmedSpy = jest.spyOn(hitBTCOrderCreator["orderTracker"], "setOrderUnconfirmed");

        hitBTCOrderCreator.createOrder(["BTC", "USD"], 10, 2, OrderSide.BUY);

        expect(unconfirmedSpy).toBeCalledWith(expect.any(String));
    });

    it("Should send create order command to connection", () => {
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.createOrder(["BTC", "USD"], 10, 2, OrderSide.BUY);

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
    it("Should set adjust order as unconfirmed", () => {
        const unconfirmedSpy = jest.spyOn(hitBTCOrderCreator["orderTracker"], "setOrderUnconfirmed");

        hitBTCOrderCreator.adjustOrder(FX_NEW_BUY_ORDER, 10, 1);

        expect(unconfirmedSpy).toBeCalledWith("NEW_BUY_ORDER_1");
    });

    it("Should send adjust command to connection", () => {
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.adjustOrder(FX_NEW_BUY_ORDER, 10, 1);

        expect(sendSpy.mock.calls[0][0]).toBeInstanceOf(HitBTCCommand);
        expect(sendSpy).toBeCalledWith({
            method: "cancelReplaceOrder",
            params: {
                clientOrderId: "NEW_BUY_ORDER_1",
                price: 10,
                quantity: 1,
                requestClientId: expect.any(String),
                strictValidate: true,
            },
            restorable: false,
        });
    });

    it("Should not adjust when order is unconfirmed", () => {
        hitBTCOrderCreator["orderTracker"].isOrderUnconfirmed = jest.fn(() => true);
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.adjustOrder(FX_NEW_BUY_ORDER, 10, 1);

        expect(sendSpy).toBeCalledTimes(0);
    });

    test.each([
        [100, 2, 1], [10, 1, 1], [100, 1, 0],
    ])("Should not adjust when price and quantity is unchanged", (price, qty, result) => {
        const sendSpy = jest.spyOn(hitBTCOrderCreator["connection"], "send");

        hitBTCOrderCreator.adjustOrder(FX_NEW_BUY_ORDER, price, qty);

        expect(sendSpy).toBeCalledTimes(result);
    });
});
