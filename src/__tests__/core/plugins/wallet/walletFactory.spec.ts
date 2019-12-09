import WalletFactory from "../../../../sockTrader/core/plugins/wallet/walletFactory";

describe("getInstance", () => {
    test("Should return the same Wallet instance", () => {
        expect(WalletFactory.getInstance()).toStrictEqual(WalletFactory.getInstance());
    });
});
