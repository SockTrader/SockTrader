/* tslint:disable */
import "jest";
import {IOrder, OrderSide, OrderStatus, OrderTimeInForce, OrderType, ReportType} from "../core/orderInterface";
import moment from "moment";
import Wallet from "../core/wallet";

let order: IOrder;
beforeEach(() => {
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

describe("assets property", () => {
    test("Undefined assets should be 0", () => {
        const wallet = new Wallet({BTC: 1});
        expect(wallet["assets"]["strange_unknown_coin"]).toBe(0)
        expect(wallet["assets"]["strange_unknown_coin"]).not.toBe(undefined)
    });
})

describe("isSellAllowed", () => {
    test("Should allow sell when enough funds", () => {
        const wallet1 = new Wallet({BTC: 1});
        const allowed1 = wallet1.isSellAllowed({...order, side: OrderSide.SELL});
        expect(allowed1).toBe(true);

        wallet1.setAssets({BTC: 0.5})
        const allowed2 = wallet1.isSellAllowed({...order, side: OrderSide.SELL});
        expect(allowed2).toBe(true);
    });

    test("Should block sell when enough funds", () => {
        const wallet = new Wallet({BTC: 0});
        const allowed = wallet.isSellAllowed({...order, side: OrderSide.SELL});
        expect(allowed).toBe(false);
    });
});

describe("isBuyAllowed", () => {
    test("Should allow buy when enough funds", () => {
        const wallet = new Wallet({USD: 10});
        const allowed1 = wallet.isBuyAllowed(order);
        expect(allowed1).toBe(true);

        wallet.setAssets({USD: 5});
        const allowed2 = wallet.isBuyAllowed(order);
        expect(allowed2).toBe(true);
    });

    test("Should block buy when enough funds", () => {
        const wallet = new Wallet({USD: 0});
        const allowed = wallet.isBuyAllowed(order);
        expect(allowed).toBe(false);
    });
});