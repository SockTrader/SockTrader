import {IOrder, OrderSide, OrderStatus, ReportType} from "./orderInterface";

export interface IAssetMap {
    [key: string]: number;
}

/**
 * The wallet keeps track of all assets
 * strategy testing
 */
export default class Wallet {

    private assets!: IAssetMap;

    /**
     * Creates a new LocalExchange
     */
    constructor(assets: IAssetMap) {
        this.setAssets(assets);
    }

    /**
     * Checks if funds are sufficient for a buy
     * @param {IOrder} order the order to verify
     * @param {IOrder} oldOrder
     * @returns {boolean} is buy allowed
     */
    isBuyAllowed(order: IOrder, oldOrder?: IOrder): boolean {
        const orderPrice: number = this.getOrderPrice(order);

        return this.assets[order.pair[1]] >= orderPrice;
    }

    /**
     * Checks if current quantity of currency in possession
     * if sufficient for given sell order
     * @param {IOrder} order the order to verify
     * @param {IOrder} oldOrder
     * @returns {boolean} is sell allowed
     */
    isSellAllowed(order: IOrder, oldOrder?: IOrder): boolean {
        return this.assets[order.pair[0]] >= order.quantity;
    }

    setAssets(assets: IAssetMap) {
        this.assets = new Proxy<IAssetMap>(assets, {
            get: (target: IAssetMap, p: PropertyKey): any => {
                return p in target ? target[p.toString()] : 0;
            },
        });
    }

    // @TODO test and verify logic..
    /**
     * Updates the assets on the exchange for given new order
     * @param {IOrder} order new order
     * @param {IOrder} oldOrder old order
     */
    updateAssets(order: IOrder, oldOrder?: IOrder) {
        const [target, source] = order.pair;

        // if (order.side === OrderSide.SELL) {
        //     target = order.pair[1];
        //     source = order.pair[0];
        // }

        if (ReportType.REPLACED === order.reportType && oldOrder) {
            // @TODO ..
        } else if (ReportType.NEW === order.reportType) {
            if (order.side === OrderSide.BUY) {
                this.assets[source] -= this.getOrderPrice(order);
            } else {
                this.assets[target] -= order.quantity;
            }
        } else if (ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status) {
            if (order.side === OrderSide.BUY) {
                this.assets[target] += order.quantity;
            } else {
                this.assets[source] += this.getOrderPrice(order);
            }
            console.log(this.assets);
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.assets[source] += this.getOrderPrice(order);
        }
    }

    /**
     * Calculates total price of order
     * @param {IOrder} order the order
     * @returns {number} total price
     */
    private getOrderPrice(order: IOrder) {
        return order.price * order.quantity;
    }
}
