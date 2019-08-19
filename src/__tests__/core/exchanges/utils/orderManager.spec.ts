import moment from "moment";
import OrderTracker from "../../../../sockTrader/core/exchanges/utils/orderTracker";
import {IOrder, OrderSide} from "../../../../sockTrader/core/types/order";

let orderTracker = new OrderTracker();
beforeEach(() => {
    orderTracker = new OrderTracker();
});


describe("setOrderUnconfirmed", () => {
    test("Should have no unconfirmedOrders when created", () => {
        expect(orderTracker["unconfirmedOrders"]).toEqual({});
    });

    test("Should mark an order as unconfirmed", () => {
        orderTracker.setOrderUnconfirmed("123");
        expect(orderTracker["unconfirmedOrders"]).toEqual({"123": true});
    });
});

describe("setOrderConfirmed", () => {
    test("Should remove from unconfirmed orders", () => {
        orderTracker.setOrderUnconfirmed("123");
        orderTracker.setOrderConfirmed("123");
        expect(orderTracker["unconfirmedOrders"]).toEqual({});
    });
});

describe("isOrderUnconfirmed", () => {
    test("Should return undefined when order not found", () => {
        expect(orderTracker.isOrderUnconfirmed("123")).toEqual(undefined);
    });

    test("Should mark an order as unconfirmed", () => {
        orderTracker.setOrderUnconfirmed("123");
        expect(orderTracker.isOrderUnconfirmed("123")).toEqual(true);
    });
});

describe("get/set OpenOrders", () => {
    test("Should set and get all open orders", () => {
        orderTracker.setOpenOrders([{createdAt: moment(), price: 13.0, side: OrderSide.SELL}] as IOrder[]);
        expect(orderTracker.getOpenOrders()).toEqual(expect.objectContaining([{
            createdAt: expect.any(moment),
            side: OrderSide.SELL,
            price: 13.0,
        }]));
    });
});

describe("replaceOpenOrder", () => {
    test("Should set and get all open orders", () => {
        const oldOrder = {id: "1", price: 10, side: OrderSide.BUY} as IOrder;

        orderTracker.setOpenOrders([oldOrder]);
        const foundOrder = orderTracker.replaceOpenOrder({
            id: "2",
            price: 11,
            side: OrderSide.SELL,
        } as IOrder, "1");

        expect(foundOrder).toEqual(oldOrder);
        expect(orderTracker.getOpenOrders()).toEqual([{id: "2", price: 11, side: OrderSide.SELL}]);
    });
});

describe("addOpenOrder", () => {
    test("Should add open order", () => {
        const order = {id: "1", price: 10, side: OrderSide.BUY} as IOrder;
        expect(orderTracker["openOrders"]).toEqual([]);

        orderTracker.addOpenOrder(order);
        expect(orderTracker["openOrders"]).toEqual([{id: "1", price: 10, side: OrderSide.BUY}]);
    });
});

describe("removeOpenOrder", () => {
    test("Should remove open order", () => {
        orderTracker["openOrders"] = [
            {id: "1", price: 10, side: OrderSide.BUY},
            {id: "2", price: 11, side: OrderSide.BUY},
        ] as IOrder[];

        orderTracker.removeOpenOrder("2");
        expect(orderTracker["openOrders"]).toEqual([{id: "1", price: 10, side: OrderSide.BUY}]);
    });
});

describe("findOpenOrder", () => {
    test("Should find an open order", () => {
        orderTracker["openOrders"] = [{id: "1", price: 10, side: OrderSide.BUY}] as IOrder[];

        const openOrder = orderTracker.findOpenOrder("1");
        expect(openOrder).toEqual({id: "1", price: 10, side: OrderSide.BUY});
    });

    test("Should return undefined if nothing found", () => {
        orderTracker["openOrders"] = [{id: "1", price: 10, side: OrderSide.BUY}] as IOrder[];

        const openOrder = orderTracker.findOpenOrder("10");
        expect(openOrder).toEqual(undefined);
    });
});

describe("canAdjustOrder", () => {
    test("Should disallow order in progress to be adjusted", () => {
        const order: IOrder = {id: "test_order_id", price: 0.001263, quantity: 0.02} as any;

        expect(orderTracker.canAdjustOrder(order, 0.002, 0.02)).toBe(true);
        expect(orderTracker.canAdjustOrder(order, 0.002, 0.02)).toBe(false);
    });

    test("Should disallow order to be adjusted when nothing changed", () => {
        const order: IOrder = {id: "test_order_id", price: 0.001263, quantity: 0.02} as any;

        expect(orderTracker.canAdjustOrder(order, 0.001263, 0.02)).toBe(false);
    });
});
