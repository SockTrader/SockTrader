import {walletLogger} from "../../loggerFactory";
import {AssetMap} from "../../types/wallet";
import BasePlugin from "../basePlugin";

export default class WalletLogger extends BasePlugin {

    constructor() {
        super();
        this.onEvent("core.updateAssets", this.onUpdateAssets.bind(this));
    }

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

}
