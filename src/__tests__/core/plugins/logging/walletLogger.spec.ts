import {walletLogger} from "../../../../sockTrader/core/logger";
import WalletLogger from "../../../../sockTrader/core/plugins/logging/walletLogger";
import {AssetMap} from "../../../../sockTrader/core/plugins/wallet/wallet";

jest.mock("../../../../sockTrader/core/logger");

describe("onUpdateAssets", () => {
    it("Should log reserved and non reserved assets", () => {
        const assets: AssetMap = {BTC: 1, USD: 10};
        const reserved: AssetMap = {USD: 1000};

        const logger = new WalletLogger();
        logger.onUpdateAssets(assets, reserved);

        expect(walletLogger.info).toBeCalledWith("wallet: [{\"asset\":\"BTC\",\"value\":1},{\"asset\":\"USD\",\"value\":10}]");
        expect(walletLogger.info).toBeCalledWith("reservedWallet: [{\"asset\":\"USD\",\"value\":1000}]");
    });
});

describe("objectToArray", () => {
    it("Should convert AssetMap to Array", () => {
        const assets: AssetMap = {BTC: 1, USD: 10};

        const logger = new WalletLogger();
        const result = logger.objectToArray(assets);

        expect(result).toEqual([{asset: "BTC", value: 1}, {asset: "USD", value: 10}]);
    });
});
