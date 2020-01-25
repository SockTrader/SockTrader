import {FX_NEW_BUY_ORDER, FX_NEW_SELL_ORDER} from "../../../../__fixtures__/order";
import {SubWallet} from "../../../../sockTrader/core/wallet/subWallet";

let subWallet: SubWallet;
beforeEach(() => {
    subWallet = new SubWallet({BTC: 1});
});

describe("assets property", () => {
    it("Should return 0 for unknown assets", () => {
        expect(subWallet["assets"]["strange_unknown_coin"]).toEqual(0);
        expect(subWallet["assets"]["strange_unknown_coin"]).not.toEqual(undefined);
    });
});

describe("isBuyAllowed", () => {
    it("Should return true when Wallet has enough funds", () => {
        const wallet1 = new SubWallet({USD: 200});
        expect(wallet1.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(true);

        const wallet2 = new SubWallet({USD: 100});
        expect(wallet2.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(true);
    });

    it("Should return false when Wallet has NOT enough funds", () => {
        const wallet = new SubWallet({USD: 0});
        expect(wallet.isBuyAllowed(FX_NEW_BUY_ORDER)).toBe(false);
    });
});

describe("isSellAllowed", () => {
    it("Should return true when Wallet has enough funds", () => {
        const wallet1 = new SubWallet({BTC: 2});
        expect(wallet1.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(true);

        const wallet2 = new SubWallet({BTC: 1});
        expect(wallet2.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(true);
    });

    it("Should return false when Wallet has NOT enough funds", () => {
        const wallet = new SubWallet({BTC: 0});
        expect(wallet.isSellAllowed(FX_NEW_SELL_ORDER)).toBe(false);
    });
});
