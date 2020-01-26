import {FX_NEW_BUY_ORDER, FX_NEW_SELL_ORDER} from "../../../../__fixtures__/order";
import {AssetCollection} from "../../../../sockTrader/core/wallet/assetCollection";

let assetCollection: AssetCollection;
beforeEach(() => {
    assetCollection = new AssetCollection({BTC: 1});
});

describe("assets property", () => {
    it("Should return 0 for unknown assets", () => {
        expect(assetCollection["assets"]["strange_unknown_coin"]).toEqual(0);
        expect(assetCollection["assets"]["strange_unknown_coin"]).not.toEqual(undefined);
    });
});

describe("isBuyAllowed", () => {
    it("Should return true when Wallet has enough funds", () => {
        const collection1 = new AssetCollection({USD: 200});
        expect(collection1.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(true);

        const collection2 = new AssetCollection({USD: 100});
        expect(collection2.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(true);
    });

    it("Should return false when Wallet has NOT enough funds", () => {
        const collection = new AssetCollection({USD: 0});
        expect(collection.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(false);
    });
});

describe("isSellAllowed", () => {
    it("Should return true when Wallet has enough funds", () => {
        const collection1 = new AssetCollection({BTC: 2});
        expect(collection1.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(true);

        const collection2 = new AssetCollection({BTC: 1});
        expect(collection2.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(true);
    });

    it("Should return false when Wallet has NOT enough funds", () => {
        const collection = new AssetCollection({BTC: 0});
        expect(collection.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(false);
    });
});
