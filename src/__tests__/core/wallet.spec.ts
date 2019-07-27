import {
    IOrder,
    OrderSide,
    OrderStatus,
    OrderTimeInForce,
    OrderType,
    ReportType,
} from "../../sockTrader/core/types/order";
import moment from "moment";
import Wallet from "../../sockTrader/core/assets/wallet";

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
        expect(wallet["assets"]["strange_unknown_coin"]).toBe(0);
        expect(wallet["assets"]["strange_unknown_coin"]).not.toBe(undefined);
    });
});

describe("isSellAllowed", () => {
    test("Should allow sell when enough funds", () => {
        const wallet = new Wallet({BTC: 1});
        const allowed1 = wallet.isSellAllowed({...order, side: OrderSide.SELL});
        expect(allowed1).toBe(true);

        wallet.setAssets({BTC: 0.5});
        const allowed2 = wallet.isSellAllowed({...order, side: OrderSide.SELL});
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

describe("updateAssets", () => {
    let wallet: Wallet;
    beforeEach(() => {
        wallet = new Wallet({USD: 10});
    });

    test("Should reserve assets when creating a new order", () => {
        wallet.updateAssets({...order, side: OrderSide.BUY});
        expect(wallet["assets"]).toEqual({USD: 5});

        wallet.setAssets({BTC: 10});
        wallet.updateAssets({...order, side: OrderSide.SELL});
        expect(wallet["assets"]).toEqual({BTC: 9.5});
    });

    test("Should apply new asset state when order is filled", () => {
        const filledOrder = {...order, reportType: ReportType.TRADE, status: OrderStatus.FILLED};

        wallet.updateAssets({...filledOrder, side: OrderSide.BUY});
        expect(wallet["assets"]).toEqual({USD: 10, BTC: 0.5});

        wallet.setAssets({USD: 10});
        wallet.updateAssets({...filledOrder, side: OrderSide.SELL});
        expect(wallet["assets"]).toEqual({USD: 15});
    });

    test("Should revert assets when a new order is canceled/expired/suspended", () => {
        wallet.updateAssets({...order, side: OrderSide.BUY, reportType: ReportType.CANCELED});
        expect(wallet["assets"]).toEqual({USD: 15});

        wallet.setAssets({USD: 10});
        wallet.updateAssets({...order, side: OrderSide.SELL, reportType: ReportType.CANCELED});
        expect(wallet["assets"]).toEqual({USD: 10, BTC: 0.5});
    });

    test("Should update asset amount when buy order is replaced", () => {
        const oldOrder1: IOrder = {...order, quantity: 1, side: OrderSide.BUY, reportType: ReportType.NEW};
        wallet.updateAssets(oldOrder1);
        expect(wallet["assets"]).toEqual({USD: 0});

        wallet.updateAssets({...oldOrder1, quantity: 0.5, reportType: ReportType.REPLACED}, oldOrder1);
        expect(wallet["assets"]).toEqual({USD: 5});
    });

    test("Should do nothing when order reports are invalid", () => {
        const mock = jest.fn();
        wallet["createCalculator"] = jest.fn((): any => mock);

        // a report type can never be INVALID
        const invalidOrder1 = {...order, reportType: "INVALID"} as any;
        wallet.updateAssets(invalidOrder1, invalidOrder1);

        // a report of type trade should always be filled or partially-filled
        const invalidOrder2 = {...order, reportType: "trade", status: "INVALID"} as any;
        wallet.updateAssets(invalidOrder2, invalidOrder2);

        // a report type can never be INVALID when status is filled
        const invalidOrder3 = {...order, reportType: "INVALID", status: "filled"} as any;
        wallet.updateAssets(invalidOrder3, invalidOrder3);

        expect(mock).toHaveBeenCalledTimes(0);
    });

    test("Should do nothing when trying to replace and oldOrder which is undefined", () => {
        const calculator = jest.fn();
        wallet["createCalculator"] = jest.fn(() => calculator);

        const oldOrder1: IOrder = {...order, quantity: 1, side: OrderSide.BUY, reportType: ReportType.NEW};
        wallet.updateAssets({...oldOrder1, quantity: 0.5, reportType: ReportType.REPLACED}, undefined);

        expect(calculator).toHaveBeenCalledTimes(0);
    });

    test("Should update asset amount when sell order is replaced", () => {
        const wallet = new Wallet({BTC: 10});
        const oldOrder1: IOrder = {...order, quantity: 1, side: OrderSide.SELL, reportType: ReportType.NEW};
        wallet.updateAssets(oldOrder1);
        expect(wallet["assets"]).toEqual({BTC: 9});

        const oldOrder2: IOrder = {...oldOrder1, quantity: 2, reportType: ReportType.REPLACED};
        wallet.updateAssets(oldOrder2, oldOrder1);
        expect(wallet["assets"]).toEqual({BTC: 8});

        wallet.updateAssets({...oldOrder1, price: 10, reportType: ReportType.REPLACED}, oldOrder2);
        expect(wallet["assets"]).toEqual({BTC: 9});
    });
});

describe("isOrderAllowed", () => {
    test("Should check if buy is allowed", () => {
        const wallet = new Wallet({BTC: 1});

        const spyBuy = jest.spyOn(wallet, "isBuyAllowed");
        const mockOrder = {...order, side: OrderSide.BUY} as IOrder;

        wallet.isOrderAllowed(mockOrder as IOrder, mockOrder as IOrder);
        expect(spyBuy).toBeCalledWith(mockOrder, mockOrder);
    });

    test("Should check if sell is allowed", () => {
        const wallet = new Wallet({BTC: 1});

        const spySell = jest.spyOn(wallet, "isSellAllowed");
        const mockOrder = {...order, side: OrderSide.SELL} as IOrder;

        wallet.isOrderAllowed(mockOrder, mockOrder);
        expect(spySell).toBeCalledWith(mockOrder, mockOrder);
    });
});
