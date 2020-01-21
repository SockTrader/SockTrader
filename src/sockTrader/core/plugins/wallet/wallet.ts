import Events from "../../events";
import {Order, OrderSide, OrderStatus, ReportType} from "../../types/order";
import {Pair} from "../../types/pair";
import {AssetCalculator, AssetMap, OrderSideCalculator, OrderSideCalculators} from "../../types/wallet";
import {SubWallet} from "./subWallet";

/**
 * The wallet keeps track of all assets
 */
export default class Wallet {

    private readonly assets: SubWallet;
    private readonly reservedAssets: SubWallet;

    constructor(assets: AssetMap) {
        this.assets = new SubWallet(assets);
        this.reservedAssets = new SubWallet({});
    }

    /**
     * Validates if the wallet has sufficient funds to cover the given order.
     * @param order
     */
    isOrderAllowed(order: Order): boolean {
        return order.side === OrderSide.BUY ? this.assets.isBuyAllowed(order) : this.assets.isSellAllowed(order);
    }

    private createOrderSideCalculator(orderSide: OrderSide, side: OrderSide): OrderSideCalculator {
        return (asset: string, calc: AssetCalculator, priceQty: number) => {
            if (orderSide === side) calc(asset, priceQty);
        };
    }

    private createCalculators(order: Order): OrderSideCalculators {
        return {
            ifBuy: this.createOrderSideCalculator(order.side, OrderSide.BUY),
            ifSell: this.createOrderSideCalculator(order.side, OrderSide.SELL),
        };
    }

    /**
     * The reservation of assets will be reverted in case an order has been canceled / replaced.
     */
    private revertAssetReservation(price: number, quantity: number, [quote, base]: Pair, {ifBuy, ifSell}: OrderSideCalculators): void {
        ifBuy(base, this.assets.addAsset, price * quantity);
        ifSell(quote, this.assets.addAsset, quantity);
        ifBuy(base, this.reservedAssets.subtractAsset, price * quantity);
        ifSell(quote, this.reservedAssets.subtractAsset, quantity);
    }

    /**
     * Reserve assets. This will prevent a trader from spending the same amount twice.
     * Ofc the exchange would throw an error at some point.
     */
    private reserveAsset(price: number, quantity: number, [quote, base]: Pair, {ifBuy, ifSell}: OrderSideCalculators): void {
        ifBuy(base, this.assets.subtractAsset, price * quantity);
        ifSell(quote, this.assets.subtractAsset, quantity);
        ifBuy(base, this.reservedAssets.addAsset, price * quantity);
        ifSell(quote, this.reservedAssets.addAsset, quantity);
    }

    /**
     * The trade is considered to be filled and assets will be released on the other side.
     */
    private releaseAsset(price: number, quantity: number, [quote, base]: Pair, {ifBuy, ifSell}: OrderSideCalculators): void {
        ifBuy(quote, this.assets.addAsset, quantity);
        ifSell(base, this.assets.addAsset, price * quantity);
        ifBuy(base, this.reservedAssets.subtractAsset, price * quantity);
        ifSell(quote, this.reservedAssets.subtractAsset, quantity);
    }

    private emitUpdate() {
        return Events.emit("core.updateAssets", this.assets.getAssets(), this.reservedAssets.getAssets());
    }

    /**
     * Updates the assets on the exchange for given new order
     * @param {Order} order new order
     * @param {Order} oldOrder old order
     */
    updateAssets(order: Order, oldOrder?: Order) {
        const calculators = this.createCalculators(order);

        if (ReportType.REPLACED === order.reportType && oldOrder) {
            this.revertAssetReservation(oldOrder.price, oldOrder.quantity, oldOrder.pair, this.createCalculators(oldOrder));
            this.reserveAsset(order.price, order.quantity, order.pair, calculators);
            return this.emitUpdate();
        }

        if (ReportType.NEW === order.reportType) {
            this.reserveAsset(order.price, order.quantity, order.pair, calculators);
            return this.emitUpdate();
        }

        if (ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status) {
            // @TODO what if order is partially filled?
            this.releaseAsset(order.price, order.quantity, order.pair, calculators);
            return this.emitUpdate();
        }

        if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.revertAssetReservation(order.price, order.quantity, order.pair, calculators);
            return this.emitUpdate();
        }

        return undefined;
    }
}
