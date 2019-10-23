import {IAssetMap} from "../../assets/wallet";
import {walletLogger} from "../../logger";
import {IAssetAware} from "../../types/plugins/IAssetAware";

export default class WalletLogger implements IAssetAware {

    onUpdateAssets(assets: IAssetMap, reservedAssets: IAssetMap) {
        walletLogger.info(`wallet: ${JSON.stringify(assets)}`);
        walletLogger.info(`reservedWallet: ${JSON.stringify(reservedAssets)}`);
    }

}
