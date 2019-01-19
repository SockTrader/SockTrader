/* tslint:disable */
import "jest";
import LocalExchange from "../core/exchanges/localExchange";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../core/orderInterface";
import moment from "moment";

let exc;
let order: IOrder;
beforeEach(() => {
    exc = new LocalExchange();
    order = {
        id: "123",
        createdAt: moment(),
        price: 10,
        quantity: 0.5,
        reportType: ReportType.NEW,
        side: OrderSide.BUY,
        status: OrderStatus.NEW,
        pair: ["BTC", "USD"],
        timeInForce: OrderTimeInForce.GOOD_TILL_CANCEL,
        type: OrderType.LIMIT,
        updatedAt: moment(),
    };
});

describe("isSellAllowed", () => {
    test("Should allow sell when enough funds", () => {
        exc["assets"] = {BTC: 1};
        const allowed1 = exc["isSellAllowed"]({...order, side: OrderSide.SELL});
        expect(allowed1).toBe(true);

        exc["assets"] = {BTC: 0.5};
        const allowed2 = exc["isSellAllowed"]({...order, side: OrderSide.SELL});
        expect(allowed2).toBe(true);
    });

    test("Should block sell when enough funds", () => {
        exc["assets"] = {BTC: 0};
        const allowed = exc["isSellAllowed"]({...order, side: OrderSide.SELL});
        expect(allowed).toBe(false);
    });
});

describe("isBuyAllowed", () => {
    test("Should allow buy when enough funds", () => {
        exc["assets"] = {USD: 10};
        const allowed1 = exc["isBuyAllowed"](order);
        expect(allowed1).toBe(true);

        exc["assets"] = {USD: 5};
        const allowed2 = exc["isBuyAllowed"](order);
        expect(allowed2).toBe(true);
    });

    test("Should block buy when enough funds", () => {
        exc["assets"] = {BTC: 0};
        const allowed = exc["isBuyAllowed"](order);
        expect(allowed).toBe(false);
    });
});