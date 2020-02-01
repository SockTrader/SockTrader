import {Order} from "../../../../sockTrader/core/types/order";
import Wallet from "../../../../sockTrader/core/wallet/wallet";
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
import Events from "../../../../sockTrader/core/events";

let wallet = new Wallet({BTC: 1});
beforeEach(() => {
    wallet = new Wallet({BTC: 1});
});

describe("isOrderAllowed", () => {
    it("Should check if buy is allowed", () => {
        const spy = jest.spyOn(wallet["assets"], "isBuyAllowed");

        wallet.isOrderAllowed(FX_NEW_BUY_ORDER);
        expect(spy).toBeCalledWith(FX_NEW_BUY_ORDER);
    });

    it("Should check if sell is allowed", () => {
        const spy = jest.spyOn(wallet["assets"], "isSellAllowed");

        wallet.isOrderAllowed(FX_NEW_SELL_ORDER);
        expect(spy).toBeCalledWith(FX_NEW_SELL_ORDER);
    });
});

describe("updateAssets", () => {

    const spy = jest.fn();
    let wallet: Wallet;

    beforeEach(() => {
        Events.on("core.updateAssets", spy);
        wallet = new Wallet({USD: 1000, BTC: 10});
    });

    afterEach(() => {
        Events.removeAllListeners();
        jest.clearAllMocks();
    });

    it("Should reserve assets when creating a new buy order", () => {
        wallet.updateAssets(FX_NEW_BUY_ORDER);
        expect(spy).toBeCalledWith({USD: 900, BTC: 10}, {USD: 100});
    });

    it("Should reserve assets when creating a new sell order", () => {
        wallet.updateAssets(FX_NEW_SELL_ORDER);
        expect(spy).toBeCalledWith({USD: 1000, BTC: 9}, {BTC: 1});
    });

    it("Should apply new asset state when buy order is filled", () => {
        wallet.updateAssets(FX_NEW_BUY_ORDER);
        expect(spy).toHaveBeenNthCalledWith(1, {USD: 900, BTC: 10}, {USD: 100});

        wallet.updateAssets(FX_FILLED_BUY_ORDER);
        expect(spy).toHaveBeenNthCalledWith(2, {USD: 900, BTC: 11}, {USD: 0});
    });

    it("Should apply new asset state when sell order is filled", () => {
        wallet.updateAssets(FX_NEW_SELL_ORDER);
        expect(spy).toHaveBeenNthCalledWith(1, {USD: 1000, BTC: 9}, {BTC: 1});

        wallet.updateAssets(FX_FILLED_SELL_ORDER);
        expect(spy).toHaveBeenNthCalledWith(2, {USD: 1100, BTC: 9}, {BTC: 0});
    });

    it("Should revert assets when a new buy order is canceled/expired/suspended", () => {
        wallet.updateAssets(FX_NEW_BUY_ORDER);
        expect(spy).toHaveBeenNthCalledWith(1, {USD: 900, BTC: 10}, {USD: 100});

        wallet.updateAssets(FX_CANCELLED_BUY_ORDER);
        expect(spy).toHaveBeenNthCalledWith(2, {USD: 1000, BTC: 10}, {USD: 0});
    });

    it("Should revert assets when a new sell order is canceled/expired/suspended", () => {
        wallet.updateAssets(FX_NEW_SELL_ORDER);
        expect(spy).toHaveBeenNthCalledWith(1, {USD: 1000, BTC: 9}, {BTC: 1});

        wallet.updateAssets(FX_CANCELLED_SELL_ORDER);
        expect(spy).toHaveBeenNthCalledWith(2, {USD: 1000, BTC: 10}, {BTC: 0});
    });

    it("Should update asset amount when buy order is replaced", () => {
        const oldOrder1: Order = FX_NEW_BUY_ORDER;
        wallet.updateAssets(oldOrder1);
        expect(spy).toHaveBeenNthCalledWith(1, {USD: 900, BTC: 10}, {USD: 100});

        wallet.updateAssets(FX_REPLACED_BUY_ORDER, oldOrder1);
        expect(spy).toHaveBeenNthCalledWith(2, {USD: 850, BTC: 10}, {USD: 150});
    });

    it("Should do nothing when order reports are invalid", () => {
        // a report type can never be INVALID
        const invalidOrder1 = {...FX_NEW_BUY_ORDER, reportType: "INVALID"} as any;
        wallet.updateAssets(invalidOrder1, invalidOrder1);

        // a report of type trade should always be filled or partially-filled
        const invalidOrder2 = {...FX_NEW_BUY_ORDER, reportType: "trade", status: "INVALID"} as any;
        wallet.updateAssets(invalidOrder2, invalidOrder2);

        // a report type can never be INVALID when status is filled
        const invalidOrder3 = {...FX_NEW_BUY_ORDER, reportType: "INVALID", status: "filled"} as any;
        wallet.updateAssets(invalidOrder3, invalidOrder3);

        expect(spy).toBeCalledTimes(1);
    });

    it("Should do nothing when trying to replace and oldOrder which is undefined", () => {
        wallet.updateAssets(FX_REPLACED_BUY_ORDER, undefined);

        expect(spy).toBeCalledTimes(1);
    });

    it("Should update asset amount when sell order is replaced", () => {
        const wallet = new Wallet({BTC: 10});

        wallet.updateAssets(FX_NEW_SELL_ORDER);
        expect(spy).toHaveBeenNthCalledWith(2, {BTC: 9}, {BTC: 1});

        const oldOrder2: Order = FX_REPLACED_SELL_ORDER;
        wallet.updateAssets(oldOrder2, FX_NEW_SELL_ORDER);
        expect(spy).toHaveBeenNthCalledWith(3, {BTC: 8}, {BTC: 2});

        wallet.updateAssets({...FX_REPLACED_SELL_ORDER, price: 10, quantity: 1}, oldOrder2);
        expect(spy).toHaveBeenNthCalledWith(4, {BTC: 9}, {BTC: 1});
    });
});
