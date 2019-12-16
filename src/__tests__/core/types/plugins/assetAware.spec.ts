import WalletLogger from "../../../../sockTrader/core/plugins/logging/walletLogger";
import {isAssetAware} from "../../../../sockTrader/core/types/plugins/assetAware";

describe("isAssetAware", () => {
    it("Should return true when called with a class that implements AssetAware", () => {
        expect(isAssetAware(new WalletLogger())).toEqual(true);
    });

    it("Should return false when called with something else", () => {
        expect(isAssetAware(false as any)).toEqual(false);
    });
});
