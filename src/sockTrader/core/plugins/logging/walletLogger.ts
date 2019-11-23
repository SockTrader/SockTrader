import {walletLogger} from "../../logger";
import {IAssetAware} from "../../types/plugins/IAssetAware";
import {IAssetMap} from "../wallet/wallet";

export default class WalletLogger implements IAssetAware {

    onUpdateAssets(assets: IAssetMap, reservedAssets: IAssetMap) {
        const assetsJSON = JSON.stringify(this.objectToArray(assets));
        const reservedAssetsJSON = JSON.stringify(this.objectToArray(reservedAssets));

        walletLogger.info(`wallet: ${assetsJSON}`);
        walletLogger.info(`reservedWallet: ${reservedAssetsJSON}`);
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

}
