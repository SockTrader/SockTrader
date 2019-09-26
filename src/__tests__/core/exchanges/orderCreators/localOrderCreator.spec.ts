import moment from "moment";
import LocalOrderCreator from "../../../../sockTrader/core/exchanges/orderCreators/localOrderCreator";
import OrderTracker from "../../../../sockTrader/core/exchanges/utils/orderTracker";
import {IOrder, OrderSide, ReportType} from "../../../../sockTrader/core/types/order";
import Wallet from "../../../../sockTrader/core/assets/wallet";
import {ICandle} from "../../../../sockTrader/core/types/ICandle";
import HitBTC from "../../../../sockTrader/core/exchanges/hitBTC";

let localOrderCreator = new LocalOrderCreator(new OrderTracker(), new HitBTC(), new Wallet({"USD": 1000}));
beforeEach(() => {
    localOrderCreator = new LocalOrderCreator(new OrderTracker(), new HitBTC(), new Wallet({"USD": 1000}));
});

describe("cancelOrder", () => {
    test("Should set cancel order as unconfirmed", () => {
        const order = {reportType: ReportType.NEW, id: "123", pair: ["BTC", "USD"], price: 10, quantity: 1} as IOrder;
        const spy = jest.spyOn(localOrderCreator["orderTracker"], "setOrderUnconfirmed");
        const exchangeSpy = jest.spyOn(localOrderCreator["exchange"], "onReport");
        localOrderCreator.cancelOrder(order);

        expect(spy).toBeCalledWith("123");
        expect(exchangeSpy).toBeCalledWith({
            "id": "123",
            "pair": ["BTC", "USD"],
            "price": 10,
            "quantity": 1,
            "reportType": "canceled",
        });
    });
});

describe("createOrder", () => {
    test("Should create a new order", () => {
        const exchangeSpy = jest.spyOn(localOrderCreator["exchange"], "onReport");
        localOrderCreator.createOrder(["BTC", "USD"], 100, 1, OrderSide.BUY);

        expect(exchangeSpy).toBeCalledWith({
            createdAt: expect.any(moment),
            id: expect.any(String),
            pair: ["BTC", "USD"],
            price: 100,
            quantity: 1,
            reportType: "new",
            side: "buy",
            status: "new",
            timeInForce: "GTC",
            type: "limit",
            updatedAt: expect.any(moment),
        });
    });

    test("Should set new order as unconfirmed", () => {
        const spy = jest.spyOn(localOrderCreator["orderTracker"], "setOrderUnconfirmed");
        localOrderCreator.createOrder(["BTC", "USD"], 100, 1, OrderSide.BUY);
        expect(spy).toBeCalledWith(expect.any(String));
    });

    test("Should validate order in wallet", () => {
        const allowSpy = jest.spyOn(localOrderCreator["wallet"], "isOrderAllowed");
        const updateSpy = jest.spyOn(localOrderCreator["wallet"], "updateAssets");

        localOrderCreator.createOrder(["BTC", "USD"], 100, 1, OrderSide.BUY);

        expect(allowSpy).toBeCalledWith(expect.objectContaining({pair: ["BTC", "USD"], price: 100, quantity: 1}));
        expect(updateSpy).toBeCalledWith(expect.objectContaining({pair: ["BTC", "USD"], price: 100, quantity: 1}));
    });
});

describe("adjustOrder", () => {
    // @formatter:off
    const order = {id: "123", side: OrderSide.BUY, createdAt: moment(), pair: ["BTC", "USD"], price: 100, quantity: 2} as IOrder;
    // @formatter:on

    test("Should adjust an existing order", () => {
        const exchangeSpy = jest.spyOn(localOrderCreator["exchange"], "onReport");
        localOrderCreator.adjustOrder(order, 10, 1);

        expect(exchangeSpy).toBeCalledWith({
            id: expect.any(String),
            originalId: "123",
            pair: ["BTC", "USD"],
            price: 10,
            quantity: 1,
            reportType: "replaced",
            side: "buy",
            type: "limit",
            createdAt: expect.any(moment),
            updatedAt: expect.any(moment),
        });
    });

    test("Should set new order as unconfirmed", () => {
        const spy = jest.spyOn(localOrderCreator["orderTracker"], "setOrderUnconfirmed");
        localOrderCreator.adjustOrder(order, 10, 1);
        expect(spy).toBeCalledWith(expect.any(String));
    });

    test("Should validate order in wallet", () => {
        const allowSpy = jest.spyOn(localOrderCreator["wallet"], "isOrderAllowed");
        const updateSpy = jest.spyOn(localOrderCreator["wallet"], "updateAssets");

        localOrderCreator.adjustOrder(order, 10, 1);

        expect(allowSpy).toBeCalledWith(
            expect.objectContaining({price: 10, quantity: 1}),
            expect.objectContaining({price: 100, quantity: 2}),
        );
        expect(updateSpy).toBeCalledWith(
            expect.objectContaining({price: 10, quantity: 1}),
            expect.objectContaining({price: 100, quantity: 2}),
        );
    });
});

describe("getTimeOfOrder", () => {
    test("Should return time of current candle", () => {
        const currentTime = moment("2019-01-24 18:00");
        localOrderCreator.setCurrentCandle({timestamp: currentTime} as ICandle);
        const timestamp = localOrderCreator["getTimeOfOrder"]();
        expect(timestamp).toEqual(currentTime);
    });

    test("Should return server time", () => {
        const timestamp = localOrderCreator["getTimeOfOrder"]();
        expect(timestamp.diff(moment(), "minutes")).toEqual(0);
    });
});
