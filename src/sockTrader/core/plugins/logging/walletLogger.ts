import {walletLogger} from "../../loggerFactory";
import {AssetAware} from "../../types/plugins/assetAware";
import {AssetMap} from "../../types/wallet";

export default class WalletLogger implements AssetAware {

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

}
