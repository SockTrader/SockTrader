import {walletLogger} from "../../loggerFactory";
import {Candle} from "../../types/candle";
import {AssetMap} from "../../types/wallet";
import {Pair} from "../../types/pair";
import Events from "../../events";

export default class AssetValueLogger {

    private priceMap: Record<string, Candle> = {};

    constructor(private target: string) {
        Events.on("core.updateAssets", this.onUpdateAssets.bind(this));
        Events.on("core.updateCandles", this.onUpdateCandles.bind(this));
    }

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});

        Object.keys(this.priceMap).forEach(key => {
            const candle = this.priceMap[key];

            const totalWalletValue = this.totalAssetPrice(candle, key, assets);
            const totalReservedValue = this.totalAssetPrice(candle, key, reservedAssets);

            walletLogger.info({
                type: "Wallet value",
                payload: {
                    wallet: totalWalletValue,
                    reserved: totalReservedValue,
                    total: totalWalletValue + totalReservedValue,
                },
            });
        });
    }

    totalAssetPrice(candle: Candle, asset: string, assets: AssetMap) {
        const source = assets[asset] ? assets[asset] : 0;
        const target = assets[this.target] ? assets[this.target] : 0;
        return target + (source * candle.close);
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

    onUpdateCandles(candles: Candle[], pair: Pair) {
        this.priceMap[pair[0]] = candles[0];
    }

}
