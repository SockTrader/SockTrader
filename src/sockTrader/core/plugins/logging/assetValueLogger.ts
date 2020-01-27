import {walletLogger} from "../../loggerFactory";
import {Candle} from "../../types/candle";
import {AssetAware} from "../../types/plugins/assetAware";
import {CandleAware} from "../../types/plugins/candleAware";
import {AssetMap} from "../../types/wallet";

export default class AssetValueLogger implements AssetAware, CandleAware {

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

    onUpdateCandles(candles: Candle[]) {
    }

}
