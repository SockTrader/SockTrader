import {Order} from "../../../../sockTrader/core/types/order";
import Wallet from "../../../../sockTrader/core/plugins/wallet/wallet";
import {
    FX_CANCELLED_BUY_ORDER,
    FX_CANCELLED_SELL_ORDER,
    FX_FILLED_BUY_ORDER,
    FX_FILLED_SELL_ORDER,
    FX_NEW_BUY_ORDER,
    FX_NEW_SELL_ORDER,
    FX_REPLACED_BUY_ORDER,
    FX_REPLACED_SELL_ORDER,
} from "../../../../__fixtures__/order";

let wallet = new Wallet({BTC: 1});
beforeEach(() => {
    wallet = new Wallet({BTC: 1});
});

describe("assets property", () => {
    it("Should return 0 for unknown assets", () => {
        expect(wallet["assets"]["strange_unknown_coin"]).toEqual(0);
        expect(wallet["assets"]["strange_unknown_coin"]).not.toEqual(undefined);
    });
});

describe("isBuyAllowed", () => {
    it("Should return true when Wallet has enough funds", () => {
        const wallet1 = new Wallet({USD: 200});
        expect(wallet1.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(true);

        const wallet2 = new Wallet({USD: 100});
        expect(wallet2.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(true);
    });

    it("Should return false when Wallet has NOT enough funds", () => {
        const wallet = new Wallet({USD: 0});
        expect(wallet.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(false);
    });
});

describe("isSellAllowed", () => {
    it("Should return true when Wallet has enough funds", () => {
        const wallet1 = new Wallet({BTC: 2});
        expect(wallet1.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(true);

        const wallet2 = new Wallet({BTC: 1});
        expect(wallet2.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(true);
    });

    it("Should return false when Wallet has NOT enough funds", () => {
        const wallet = new Wallet({BTC: 0});
        expect(wallet.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(false);
    });
});

describe("isOrderAllowed", () => {
    it("Should check if buy is allowed", () => {
        const spy = jest.spyOn(wallet, "isBuyAllowed");

        wallet.isOrderAllowed(FX_NEW_BUY_ORDER);
        expect(spy).toBeCalledWith(FX_NEW_BUY_ORDER);
    });

    it("Should check if sell is allowed", () => {
        const spy = jest.spyOn(wallet, "isSellAllowed");

        wallet.isOrderAllowed(FX_NEW_SELL_ORDER);
        expect(spy).toBeCalledWith(FX_NEW_SELL_ORDER);
    });
});

describe("updateAssets", () => {
    let wallet: Wallet;
    beforeEach(() => {
        wallet = new Wallet({USD: 1000, BTC: 10});
    });

    it("Should reserve assets when creating a new buy order", () => {
        wallet.updateAssets(FX_NEW_BUY_ORDER);
        expect(wallet["assets"]).toEqual({USD: 900, BTC: 10});
        expect(wallet["reservedAssets"]).toEqual({USD: 100});
    });

    it("Should reserve assets when creating a new sell order", () => {
        wallet.updateAssets(FX_NEW_SELL_ORDER);
        expect(wallet["assets"]).toEqual({USD: 1000, BTC: 9});
        expect(wallet["reservedAssets"]).toEqual({BTC: 1});
    });

    it("Should apply new asset state when buy order is filled", () => {
        wallet.updateAssets(FX_NEW_BUY_ORDER);
        wallet.updateAssets(FX_FILLED_BUY_ORDER);

        expect(wallet["assets"]).toEqual({USD: 900, BTC: 11});
        expect(wallet["reservedAssets"]).toEqual({USD: 0});
    });

    it("Should apply new asset state when sell order is filled", () => {
        wallet.updateAssets(FX_NEW_SELL_ORDER);
        wallet.updateAssets(FX_FILLED_SELL_ORDER);

        expect(wallet["assets"]).toEqual({USD: 1100, BTC: 9});
        expect(wallet["reservedAssets"]).toEqual({BTC: 0});
    });

    it("Should revert assets when a new buy order is canceled/expired/suspended", () => {
        wallet.updateAssets(FX_NEW_BUY_ORDER);
        wallet.updateAssets(FX_CANCELLED_BUY_ORDER);

        expect(wallet["assets"]).toEqual({USD: 1000, BTC: 10});
        expect(wallet["reservedAssets"]).toEqual({USD: 0});
    });

    it("Should revert assets when a new sell order is canceled/expired/suspended", () => {
        wallet.updateAssets(FX_NEW_SELL_ORDER);
        wallet.updateAssets(FX_CANCELLED_SELL_ORDER);

        expect(wallet["assets"]).toEqual({USD: 1000, BTC: 10});
        expect(wallet["reservedAssets"]).toEqual({BTC: 0});
    });

    it("Should update asset amount when buy order is replaced", () => {
        const oldOrder1: Order = FX_NEW_BUY_ORDER;
        wallet.updateAssets(oldOrder1);
        expect(wallet["assets"]).toEqual({USD: 900, BTC: 10});

        wallet.updateAssets(FX_REPLACED_BUY_ORDER, oldOrder1);
        expect(wallet["assets"]).toEqual({USD: 850, BTC: 10});
    });

    it("Should do nothing when order reports are invalid", () => {
        const mock = jest.fn();
        wallet["createCalculator"] = jest.fn((): any => mock);

        // a report type can never be INVALID
        const invalidOrder1 = {...FX_NEW_BUY_ORDER, reportType: "INVALID"} as any;
        wallet.updateAssets(invalidOrder1, invalidOrder1);

        // a report of type trade should always be filled or partially-filled
        const invalidOrder2 = {...FX_NEW_BUY_ORDER, reportType: "trade", status: "INVALID"} as any;
        wallet.updateAssets(invalidOrder2, invalidOrder2);

        // a report type can never be INVALID when status is filled
        const invalidOrder3 = {...FX_NEW_BUY_ORDER, reportType: "INVALID", status: "filled"} as any;
        wallet.updateAssets(invalidOrder3, invalidOrder3);

        expect(mock).toHaveBeenCalledTimes(0);
    });

    it("Should do nothing when trying to replace and oldOrder which is undefined", () => {
        const calculator = jest.fn();
        wallet["createCalculator"] = jest.fn(() => calculator);

        wallet.updateAssets(FX_REPLACED_BUY_ORDER, undefined);

        expect(calculator).toHaveBeenCalledTimes(0);
    });

    it("Should update asset amount when sell order is replaced", () => {
        const wallet = new Wallet({BTC: 10});

        wallet.updateAssets(FX_NEW_SELL_ORDER);
        expect(wallet["assets"]).toEqual({BTC: 9});

        const oldOrder2: Order = FX_REPLACED_SELL_ORDER;
        wallet.updateAssets(oldOrder2, FX_NEW_SELL_ORDER);
        expect(wallet["assets"]).toEqual({BTC: 8});

        wallet.updateAssets({...FX_REPLACED_SELL_ORDER, price: 10, quantity: 1}, oldOrder2);
        expect(wallet["assets"]).toEqual({BTC: 9});
    });
});
