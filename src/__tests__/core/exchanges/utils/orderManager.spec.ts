import moment from "moment";
import OrderManager from "../../../../sockTrader/core/exchanges/utils/orderManager";
import {IOrder, OrderSide} from "../../../../sockTrader/core/types/order";

let orderManager = new OrderManager();
beforeEach(() => {
    orderManager = new OrderManager();
});


describe("setOrderProcessing", () => {
    test("Should have no processingOrders when created", () => {
        expect(orderManager["processingOrders"]).toEqual({});
    });

    test("Should mark an order as processing", () => {
        orderManager.setOrderProcessing("123");
        expect(orderManager["processingOrders"]).toEqual({"123": true});
    });

});

describe("isOrderProcessing", () => {
    test("Should return undefined when order not found", () => {
        expect(orderManager.isOrderProcessing("123")).toEqual(undefined);
    });

    test("Should mark an order as processing", () => {
        orderManager.setOrderProcessing("123");
        expect(orderManager.isOrderProcessing("123")).toEqual(true);
    });
});

describe("removeOrderProcessing", () => {
    test("Should remove order in processing", () => {
        orderManager.setOrderProcessing("123");
        orderManager.removeOrderProcessing("123");
        expect(orderManager["processingOrders"]).toEqual({});
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

describe("findAndReplaceOpenOrder", () => {
    test("Should set and get all open orders", () => {
        const oldOrder = {id: "1", price: 10, side: OrderSide.BUY} as IOrder;

        orderManager.setOpenOrders([oldOrder]);
        const foundOrder = orderManager.findAndReplaceOpenOrder({
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
