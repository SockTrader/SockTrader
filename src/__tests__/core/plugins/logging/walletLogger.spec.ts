import {walletLogger} from "../../../../sockTrader/core/loggerFactory";
import AssetValueLogger from "../../../../sockTrader/core/plugins/logging/assetValueLogger";
import {AssetMap} from "../../../../sockTrader/core/types/wallet";

jest.mock("../../../../sockTrader/core/loggerFactory");

describe("onUpdateAssets", () => {
    it("Should log reserved and non reserved assets", () => {
        const assets: AssetMap = {BTC: 1, USD: 10};
        const reserved: AssetMap = {USD: 1000};

        const logger = new AssetValueLogger();
        logger.onUpdateAssets(assets, reserved);

        expect(walletLogger.info).toBeCalledWith({type: "Wallet", payload: [{asset: "BTC", value: 1}, {asset: "USD", "value": 10}]});
        expect(walletLogger.info).toBeCalledWith({type: "Reserved wallet", payload: [{asset: "USD", value: 1000}]});
    });
});

describe("objectToArray", () => {
    it("Should convert AssetMap to Array", () => {
        const assets: AssetMap = {BTC: 1, USD: 10};

        const logger = new AssetValueLogger();
        const result = logger.objectToArray(assets);

        expect(result).toEqual([{asset: "BTC", value: 1}, {asset: "USD", value: 10}]);
    });
});
