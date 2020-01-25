import {Order} from "../types/order";
import {AssetMap} from "../types/wallet";

export class SubWallet {

    private readonly assets: AssetMap;

    constructor(assets: AssetMap) {
        this.assets = this.getAssetProxy(assets);

        this.addAsset = this.addAsset.bind(this);
        this.subtractAsset = this.subtractAsset.bind(this);
    }

    private getAssetProxy(assets: AssetMap) {
        return new Proxy<AssetMap>(assets, {
            get: (target: AssetMap, p: PropertyKey): any => {
                return p in target ? target[p.toString()] : 0;
            },
        });
    }

    /**
     * Checks if funds are sufficient for a buy
     * @param {Order} order the order to verify
     * @returns {boolean} is buy allowed
     */
    isBuyAllowed(order: Order): boolean {
        return this.assets[order.pair[1]] >= (order.price * order.quantity);
    }

    /**
     * Checks if current quantity of currency in possession
     * if sufficient for given sell order
     * @param {Order} order the order to verify
     * @returns {boolean} is sell allowed
     */
    isSellAllowed(order: Order): boolean {
        return this.assets[order.pair[0]] >= order.quantity;
    }

    addAsset(asset: string, priceQty: number): number {
        return this.assets[asset] += priceQty;
    }

    subtractAsset(asset: string, priceQty: number): number {
        return this.assets[asset] -= priceQty;
    }

    getAssets() {
        return this.assets;
    }
}
