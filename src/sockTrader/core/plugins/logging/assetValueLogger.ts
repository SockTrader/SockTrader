import {walletLogger} from "../../loggerFactory";
import {Candle} from "../../types/candle";
import {AssetMap} from "../../types/wallet";
import {Pair} from "../../types/pair";
import Events from "../../events";
import BasePlugin, {PluginConfig} from "../basePlugin";

export default class AssetValueLogger extends BasePlugin {

    private assets: AssetMap = {};
    private reservedAssets: AssetMap = {};

    constructor(config?: PluginConfig) {
        super(config);

        this.setLogger(walletLogger);

        Events.on("core.updateAssets", this.onUpdateAssets.bind(this));
        Events.on("core.updateCandles", this.onUpdateCandles.bind(this));
    }

    onUpdateAssets(assets: AssetMap, reservedAssets: AssetMap) {
        this.assets = assets;
        this.reservedAssets = reservedAssets;

        walletLogger.info({type: "Wallet", payload: this.objectToArray(assets)});
        walletLogger.info({type: "Reserved wallet", payload: this.objectToArray(reservedAssets)});
    }

    objectToArray(object: Record<string, number>) {
        return Object.entries(object).map(([asset, value]) => ({asset, value}));
    }

    onUpdateCandles(candles: Candle[], pair: Pair) {
        // @TODO .. WIP
        const totalWalletValue = this.assets[pair[1]] + (this.assets[pair[0]] * candles[0].close);
        const totalReservedValue = this.reservedAssets[pair[1]] + (this.reservedAssets[pair[0]] * candles[0].close);

        this.log({
            type: "Wallet value",
            payload: {
                wallet: totalWalletValue,
                reserved: totalReservedValue,
                total: totalWalletValue + totalReservedValue,
            },
        });
    }

}
