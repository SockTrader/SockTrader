import Events from "../events";
import {Order, OrderSide, OrderStatus, ReportType} from "../types/order";
import {AssetMap} from "../types/wallet";
import {AssetCollection} from "./assetCollection";
import {ReleaseCommand} from "./command/releaseCommand";
import {ReserveCommand} from "./command/reserveCommand";

/**
 * The wallet keeps track of all assets
 */
export default class Wallet {

    private readonly assets: AssetCollection;
    private readonly reservedAssets: AssetCollection;

    constructor(assets: AssetMap) {
        this.assets = new AssetCollection(assets);
        this.reservedAssets = new AssetCollection({});
        this.emitUpdate();
    }

    /**
     * Validates if the wallet has sufficient funds to cover the given order.
     * @param order
     */
    isOrderAllowed(order: Order): boolean {
        return order.side === OrderSide.BUY ? this.assets.isBuyAllowed(order) : this.assets.isSellAllowed(order);
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
        if (ReportType.REPLACED === order.reportType && oldOrder) {
            new ReserveCommand(this.assets, this.reservedAssets).revert(oldOrder);
            new ReserveCommand(this.assets, this.reservedAssets).apply(order);
            this.emitUpdate();
        } else if (ReportType.NEW === order.reportType) {
            new ReserveCommand(this.assets, this.reservedAssets).apply(order);
            this.emitUpdate();
        } else if (ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status) {
            // @TODO what if order is partially filled?
            new ReleaseCommand(this.assets, this.reservedAssets).apply(order);
            this.emitUpdate();
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            new ReserveCommand(this.assets, this.reservedAssets).revert(order);
            this.emitUpdate();
        }
    }
}
