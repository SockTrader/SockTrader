import {walletLogger} from "../../../../sockTrader/core/loggerFactory";
import AssetValueLogger from "../../../../sockTrader/core/plugins/logging/assetValueLogger";
import {AssetMap} from "../../../../sockTrader/core/types/wallet";
import {FX_CANDLE_1} from "../../../../__fixtures__/candles";

jest.mock("../../../../sockTrader/core/loggerFactory");

describe("onUpdateCandles", () => {
    it("Should log wallet value when assets are updated", () => {
        const assets: AssetMap = {BTC: 3, USD: 10};
        const reserved: AssetMap = {USD: 1000};

        const plugin = new AssetValueLogger({toAsset: "USD", logOnUpdateAssets: true});
        plugin.onUpdateCandles(FX_CANDLE_1, ["BTC", "USD"]);
        plugin.onUpdateAssets(assets, reserved);

        expect(walletLogger.info).toBeCalledWith({
            type: "Wallet value",
            payload: {
                reserved: 1000,
                total: 1316,
                wallet: 316,
            },
        });
    });
});

describe("onUpdateAssets", () => {
    it("Should log reserved and non reserved assets", () => {
        const assets: AssetMap = {BTC: 1, USD: 10};
        const reserved: AssetMap = {USD: 1000};

        const logger = new AssetValueLogger({toAsset: "USD"});
        logger.onUpdateAssets(assets, reserved);

        expect(walletLogger.info).toBeCalledWith({
            type: "Wallet",
            payload: [{asset: "BTC", value: 1}, {asset: "USD", "value": 10}],
        });
        expect(walletLogger.info).toBeCalledWith({type: "Reserved wallet", payload: [{asset: "USD", value: 1000}]});
    });
});

describe("objectToArray", () => {
    it("Should convert AssetMap to Array", () => {
        const assets: AssetMap = {BTC: 1, USD: 10};

        const logger = new AssetValueLogger({toAsset: "USD"});
        const result = logger.objectToArray(assets);

        expect(result).toEqual([{asset: "BTC", value: 1}, {asset: "USD", value: 10}]);
    });
});
