import OrderTracker from "../../../sockTrader/core/order/orderTracker";
import Events from "../../../sockTrader/core/events";
import {
    FX_CANCELLED_ORDER,
    FX_FILLED_BUY_ORDER,
    FX_NEW_BUY_ORDER,
    FX_NEW_SELL_ORDER,
    FX_REPLACED_BUY_ORDER,
} from "../../../__fixtures__/order";
import {orderLogger} from "../../../sockTrader/core/logger";
import {OrderStatus, ReportType} from "../../../sockTrader/core/types/order";

function createOrderTracker() {
    const orderTracker = new OrderTracker();
    orderTracker["addOpenOrder"](FX_NEW_BUY_ORDER);

    return orderTracker;
}

let orderTracker = createOrderTracker();
beforeEach(() => {
    orderTracker = createOrderTracker();
});

describe("setOrderConfirmed", () => {
    test("Should remove from unconfirmed orders", () => {
        orderTracker.setOrderUnconfirmed("123");
        expect(orderTracker["unconfirmedOrders"]).toEqual({"123": true});

        orderTracker["setOrderConfirmed"]("123");
        expect(orderTracker["unconfirmedOrders"]).toEqual({});
    });
});

describe("replaceOpenOrder", () => {
    test("Should replace open order with a new one", () => {
        const oldOrder = orderTracker["replaceOpenOrder"](FX_NEW_SELL_ORDER, FX_NEW_BUY_ORDER.id);
        expect(orderTracker["openOrders"]).toEqual([FX_NEW_SELL_ORDER]);
        expect(oldOrder).toEqual(FX_NEW_BUY_ORDER);
    });
});

describe("addOpenOrder", () => {
    test("Should add a new open order to the internal order list", () => {
        expect(orderTracker["openOrders"]).toEqual([FX_NEW_BUY_ORDER]);
    });
});

describe("removeOpenOrder", () => {
    test("Should remove an open order from the internal order list", () => {
        orderTracker["removeOpenOrder"](FX_NEW_BUY_ORDER.id);
        expect(orderTracker["openOrders"]).toEqual([]);
    });

    test("Should not delete any open orders when orderId could not be found", () => {
        orderTracker["removeOpenOrder"]("UNKNOWN");
        expect(orderTracker["openOrders"]).toEqual([FX_NEW_BUY_ORDER]);
    });
});

describe("findOpenOrder", () => {
    test("Should search and return an open order with the given orderId", () => {
        const order = orderTracker["findOpenOrder"](FX_NEW_BUY_ORDER.id);
        expect(order).toEqual(FX_NEW_BUY_ORDER);
    });

    test("Should return undefined when order could not be found", () => {
        const order = orderTracker["findOpenOrder"]("UNKNOWN");
        expect(order).toEqual(undefined);
    });
});

describe("logOpenOrders", () => {
    test("Should log a list of all open orders", () => {
        const spy = jest.spyOn(orderLogger, "info");
        orderTracker["logOpenOrders"]();

        expect(spy).toBeCalledWith("Open orders: [{\"side\":\"buy\",\"price\":100,\"quantity\":1}]");
    });
});

describe("isOrderUnconfirmed", () => {
    test("Should return false when order is NOT unconfirmed", () => {
        expect(orderTracker.isOrderUnconfirmed("123")).toEqual(false);
    });

    test("Should return true when unconfirmed", () => {
        orderTracker.setOrderUnconfirmed(FX_NEW_BUY_ORDER.id);
        expect(orderTracker.isOrderUnconfirmed(FX_NEW_BUY_ORDER.id)).toEqual(true);
    });
});

describe("setOrderUnconfirmed", () => {
    test("Should have no unconfirmedOrders when created", () => {
        expect(orderTracker["unconfirmedOrders"]).toEqual({});
    });

    test("Should mark an order as unconfirmed", () => {
        orderTracker.setOrderUnconfirmed(FX_NEW_BUY_ORDER.id);
        expect(orderTracker["unconfirmedOrders"]).toEqual({[FX_NEW_BUY_ORDER.id]: true});
    });
});

describe("get/SetOpenOrders", () => {
    test("Should get all open orders", () => {
        expect(orderTracker.getOpenOrders()).toEqual([FX_NEW_BUY_ORDER]);
    });

    test("Should set all open orders", () => {
        orderTracker.setOpenOrders([FX_NEW_SELL_ORDER]);
        expect(orderTracker.getOpenOrders()).toEqual([FX_NEW_SELL_ORDER]);
    });
});

describe("process", () => {
    test("Should confirm orders", () => {
        const spy = jest.spyOn(orderTracker, "setOrderConfirmed" as any);
        orderTracker.process(FX_NEW_BUY_ORDER);
        expect(spy).toBeCalledWith("NEW_BUY_ORDER_1");
    });

    test("Should replace open order", () => {
        const spy = jest.spyOn(Events, "emit");
        orderTracker.process(FX_REPLACED_BUY_ORDER);

        expect(orderTracker.getOpenOrders()).toEqual([FX_REPLACED_BUY_ORDER]);
        expect(spy).toBeCalledWith("core.report", FX_REPLACED_BUY_ORDER, FX_NEW_BUY_ORDER);
    });

    test("Should only replace when order report has an original order id", () => {
        const spy = jest.spyOn(orderTracker, "replaceOpenOrder" as any);
        orderTracker.process({...FX_REPLACED_BUY_ORDER, originalId: undefined});

        expect(spy).toBeCalledTimes(0);
    });

    test("Should add open order", () => {
        const emitSpy = jest.spyOn(Events, "emit");
        orderTracker.process(FX_NEW_SELL_ORDER);

        expect(orderTracker.getOpenOrders()).toContainEqual(FX_NEW_SELL_ORDER);
        expect(emitSpy).toBeCalledWith("core.report", FX_NEW_SELL_ORDER, undefined);
    });

    test("Should remove open order when order is filled", () => {
        const emitSpy = jest.spyOn(Events, "emit");
        orderTracker.process(FX_FILLED_BUY_ORDER);

        expect(orderTracker.getOpenOrders()).toEqual([]);
        expect(emitSpy).toBeCalledWith("core.report", FX_FILLED_BUY_ORDER, undefined);
    });

    test("Should not remove open order when status and reportType is not correct", () => {
        const spy = jest.spyOn(orderTracker, "removeOpenOrder" as any);
        orderTracker.process({...FX_FILLED_BUY_ORDER, reportType: "UNKNOWN", status: OrderStatus.FILLED} as any);
        orderTracker.process({...FX_FILLED_BUY_ORDER, reportType: ReportType.TRADE, status: "UNKNOWN"} as any);
        orderTracker.process({...FX_FILLED_BUY_ORDER, reportType: "UNKNOWN", status: "UNKNOWN"} as any);

        expect(spy).toBeCalledTimes(0);
    });

    test.each([
        [ReportType.CANCELED], [ReportType.EXPIRED], [ReportType.SUSPENDED],
    ])("Should remove open order when order is canceled, expired or suspended", (reportType) => {
        const spy = jest.spyOn(Events, "emit");
        orderTracker.process({...FX_CANCELLED_ORDER, reportType});

        expect(orderTracker.getOpenOrders()).toEqual([]);
        expect(spy).toBeCalledWith("core.report", {...FX_CANCELLED_ORDER, reportType}, undefined);
    });
});
