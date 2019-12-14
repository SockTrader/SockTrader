import WalletFactory from "../../../../sockTrader/core/plugins/wallet/walletFactory";

describe("getInstance", () => {
    it("Should return the same Wallet instance", () => {
        expect(WalletFactory.getInstance()).toStrictEqual(WalletFactory.getInstance());
    });
});
