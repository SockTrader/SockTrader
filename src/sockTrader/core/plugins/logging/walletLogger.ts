import {walletLogger} from "../../logger";
import {AssetAware} from "../../types/plugins/assetAware";
import {AssetMap} from "../wallet/wallet";

export default class WalletLogger implements AssetAware {

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        const assetsJSON = JSON.stringify(this.objectToArray(assets));
        const reservedAssetsJSON = JSON.stringify(this.objectToArray(reservedAssets));

        walletLogger.info(`wallet: ${assetsJSON}`);
        walletLogger.info(`reservedWallet: ${reservedAssetsJSON}`);
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

}
