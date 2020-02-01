import {walletLogger} from "../../loggerFactory";
import {Candle} from "../../types/candle";
import {AssetMap} from "../../types/wallet";
import {Pair} from "../../types/pair";
import Events from "../../events";

export default class AssetValueLogger {

    constructor() {
        Events.on("core.updateAssets", this.onUpdateAssets.bind(this));
        Events.on("core.updateCandles", this.onUpdateCandles.bind(this));
    }

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

    onUpdateCandles(candles: Candle[], pair: Pair) {
        // @TODO .. WIP
    }

}
