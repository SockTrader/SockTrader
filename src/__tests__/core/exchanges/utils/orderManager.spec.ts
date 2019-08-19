import moment from "moment";
import OrderTracker from "../../../../sockTrader/core/exchanges/utils/orderTracker";
import {IOrder, OrderSide} from "../../../../sockTrader/core/types/order";

let orderManager = new OrderTracker();
beforeEach(() => {
    orderManager = new OrderTracker();
});


describe("setOrderUnconfirmed", () => {
    test("Should have no unconfirmedOrders when created", () => {
        expect(orderManager["unconfirmedOrders"]).toEqual({});
    });

    test("Should mark an order as unconfirmed", () => {
        orderManager.setOrderUnconfirmed("123");
        expect(orderManager["unconfirmedOrders"]).toEqual({"123": true});
    });
});

describe("setOrderConfirmed", () => {
    test("Should remove from unconfirmed orders", () => {
        orderManager.setOrderUnconfirmed("123");
        orderManager.setOrderConfirmed("123");
        expect(orderManager["unconfirmedOrders"]).toEqual({});
    });
});

describe("isOrderUnconfirmed", () => {
    test("Should return undefined when order not found", () => {
        expect(orderManager.isOrderUnconfirmed("123")).toEqual(undefined);
    });

    test("Should mark an order as unconfirmed", () => {
        orderManager.setOrderUnconfirmed("123");
        expect(orderManager.isOrderUnconfirmed("123")).toEqual(true);
    });
});

describe("get/set OpenOrders", () => {
    test("Should set and get all open orders", () => {
        orderManager.setOpenOrders([{createdAt: moment(), price: 13.0, side: OrderSide.SELL}] as IOrder[]);
        expect(orderManager.getOpenOrders()).toEqual(expect.objectContaining([{
            createdAt: expect.any(moment),
            side: OrderSide.SELL,
            price: 13.0,
        }]));
    });
});

describe("replaceOpenOrder", () => {
    test("Should set and get all open orders", () => {
        const oldOrder = {id: "1", price: 10, side: OrderSide.BUY} as IOrder;

        orderManager.setOpenOrders([oldOrder]);
        const foundOrder = orderManager.replaceOpenOrder({
            id: "2",
            price: 11,
            side: OrderSide.SELL,
        } as IOrder, "1");

        expect(foundOrder).toEqual(oldOrder);
        expect(orderManager.getOpenOrders()).toEqual([{id: "2", price: 11, side: OrderSide.SELL}]);
    });
});

describe("addOpenOrder", () => {
    test("Should add open order", () => {
        const order = {id: "1", price: 10, side: OrderSide.BUY} as IOrder;
        expect(orderManager["openOrders"]).toEqual([]);

        orderManager.addOpenOrder(order);
        expect(orderManager["openOrders"]).toEqual([{id: "1", price: 10, side: OrderSide.BUY}]);
    });
});

describe("removeOpenOrder", () => {
    test("Should remove open order", () => {
        orderManager["openOrders"] = [
            {id: "1", price: 10, side: OrderSide.BUY},
            {id: "2", price: 11, side: OrderSide.BUY},
        ] as IOrder[];

        orderManager.removeOpenOrder("2");
        expect(orderManager["openOrders"]).toEqual([{id: "1", price: 10, side: OrderSide.BUY}]);
    });
});

describe("findOpenOrder", () => {
    test("Should find an open order", () => {
        orderManager["openOrders"] = [{id: "1", price: 10, side: OrderSide.BUY}] as IOrder[];

        const openOrder = orderManager.findOpenOrder("1");
        expect(openOrder).toEqual({id: "1", price: 10, side: OrderSide.BUY});
    });

    test("Should return undefined if nothing found", () => {
        orderManager["openOrders"] = [{id: "1", price: 10, side: OrderSide.BUY}] as IOrder[];

        const openOrder = orderManager.findOpenOrder("10");
        expect(openOrder).toEqual(undefined);
    });
});

describe("canAdjustOrder", () => {
    test("Should disallow order in progress to be adjusted", () => {
        const order: IOrder = {id: "test_order_id", price: 0.001263, quantity: 0.02} as any;

        expect(orderManager.canAdjustOrder(order, 0.002, 0.02)).toBe(true);
        expect(orderManager.canAdjustOrder(order, 0.002, 0.02)).toBe(false);
    });

    test("Should disallow order to be adjusted when nothing changed", () => {
        const order: IOrder = {id: "test_order_id", price: 0.001263, quantity: 0.02} as any;

        expect(orderManager.canAdjustOrder(order, 0.001263, 0.02)).toBe(false);
    });
});
