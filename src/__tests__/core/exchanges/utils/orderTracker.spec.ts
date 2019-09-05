import moment from "moment";
import OrderTracker from "../../../../sockTrader/core/exchanges/utils/orderTracker";
import {IOrder, OrderSide, OrderStatus, ReportType} from "../../../../sockTrader/core/types/order";

let orderTracker = new OrderTracker();
beforeEach(() => {
    orderTracker = new OrderTracker();
});

describe("isOrderUnconfirmed", () => {
    test("Should return undefined (falsy) when order not found", () => {
        expect(orderTracker.isOrderUnconfirmed("123")).toEqual(false);
    });

    test("Should mark an order as unconfirmed", () => {
        orderTracker.setOrderUnconfirmed("123");
        expect(orderTracker.isOrderUnconfirmed("123")).toEqual(true);
    });
});

describe("setOrderUnconfirmed", () => {
    test("Should have no unconfirmedOrders when created", () => {
        expect(orderTracker["unconfirmedOrders"]).toEqual({});
    });

    test("Should mark an order as unconfirmed", () => {
        orderTracker.setOrderUnconfirmed("123");
        expect(orderTracker["unconfirmedOrders"]).toEqual({"123": true});
    });

    test("Should remove from unconfirmed orders", () => {
        orderTracker.setOrderUnconfirmed("123");
        orderTracker["setOrderConfirmed"]("123");
        expect(orderTracker["unconfirmedOrders"]).toEqual({});
    });
});

describe("get set open orders", () => {
    test("Should set and get all open orders", () => {
        orderTracker.setOpenOrders([{createdAt: moment(), price: 13.0, side: OrderSide.SELL}] as IOrder[]);
        expect(orderTracker.getOpenOrders()).toEqual(expect.objectContaining([{
            createdAt: expect.any(moment),
            side: OrderSide.SELL,
            price: 13.0,
        }]));
    });
});

describe("process", () => {
    beforeEach(() => {
        orderTracker.process({reportType: ReportType.NEW, id: "123"} as IOrder);
    });

    test("Should confirm orders", () => {
        orderTracker.setOrderUnconfirmed("123");
        expect(orderTracker.isOrderUnconfirmed("123")).toEqual(true);
    });

    test("Should replace open order", () => {
        const result = orderTracker.process({reportType: ReportType.REPLACED, id: "456", originalId: "123"} as IOrder);

        expect(orderTracker.getOpenOrders()).toEqual([{reportType: ReportType.REPLACED, id: "456", originalId: "123"}]);
        expect(result.oldOrder).toEqual({id: "123", reportType: ReportType.NEW});
    });

    test("Should add open order", () => {
        const {oldOrder} = orderTracker.process({reportType: ReportType.NEW, price: 10, quantity: 1} as IOrder);

        expect(orderTracker.getOpenOrders()[1]).toEqual({reportType: ReportType.NEW, price: 10, quantity: 1});
        expect(oldOrder).toEqual(undefined);
    });

    test("Should remove open order when order is filled", () => {
        const order = {reportType: ReportType.TRADE, status: OrderStatus.FILLED, id: "123"} as IOrder;
        const result = orderTracker.process(order);

        expect(orderTracker.getOpenOrders()).toEqual([]);
        expect(result.oldOrder).toEqual(undefined);
    });

    test.each([
        [ReportType.CANCELED], [ReportType.EXPIRED], [ReportType.SUSPENDED],
    ])("Should remove open order when order is canceled, expired or suspended", (status) => {
        const {oldOrder} = orderTracker.process({reportType: status, id: "123"} as IOrder);
        expect(orderTracker.getOpenOrders()).toEqual([]);
        expect(oldOrder).toEqual(undefined);
    });

    test("Should remove open order when order is canceled, expired or suspended", () => {
        const {oldOrder} = orderTracker.process({
            reportType: ReportType.TRADE,
            status: OrderStatus.FILLED,
            id: "123",
        } as IOrder);

        expect(orderTracker.getOpenOrders()).toEqual([]);
        expect(oldOrder).toEqual(undefined);
    });
});
