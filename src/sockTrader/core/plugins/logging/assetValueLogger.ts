import {walletLogger} from "../../loggerFactory";
import {Candle} from "../../types/candle";
import {AssetMap} from "../../types/wallet";
import {Pair} from "../../types/pair";
import Events from "../../events";

export interface AssetValueConfig {
    toAsset: string;
    logInterval?: number;
    logOnUpdate?: boolean;
}

export default class AssetValueLogger {

    private assetMap: AssetMap = {};
    private reservedAssetMap: AssetMap = {};
    private priceMap: Record<string, Candle> = {};

    constructor(private config: AssetValueConfig) {
        Events.on("core.updateAssets", this.onUpdateAssets.bind(this));
        Events.on("core.updateCandles", this.onUpdateCandles.bind(this));

        if (config.logInterval) setInterval(() => this.logAssetValue(), config.logInterval * 1000);
    }

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        this.assetMap = assets;
        this.reservedAssetMap = reservedAssets;

        walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});

        if (this.config.logOnUpdate) this.logAssetValue();
    }

    logAssetValue() {
        Object.keys(this.priceMap).forEach(key => {
            const candle = this.priceMap[key];

            const totalAssetValue = this.totalAssetPrice(candle, key, this.assetMap);
            const totalReservedValue = this.totalAssetPrice(candle, key, this.reservedAssetMap);

            walletLogger.info({
                type: "Wallet value",
                payload: {
                    wallet: totalAssetValue,
                    reserved: totalReservedValue,
                    total: totalAssetValue + totalReservedValue,
                },
            });
        });
    }

    totalAssetPrice(candle: Candle, asset: string, assets: AssetMap) {
        const source = assets[asset] ? assets[asset] : 0;
        const target = assets[this.config.toAsset] ? assets[this.config.toAsset] : 0;
        return target + (source * candle.close);
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

    onUpdateCandles(candles: Candle[], pair: Pair) {
        this.priceMap[pair[0]] = candles[0];
    }

}
