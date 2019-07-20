import {IOrder, OrderSide, OrderStatus, ReportType} from "../types/order";

export interface IAssetMap {
    [key: string]: number;
}

type AssetCalc = (asset: string, priceQty: number) => void;

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
        this.add = this.add.bind(this);
        this.subtract = this.subtract.bind(this);
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

    /**
     * Calculates total price of order
     * @param {IOrder} order the order
     * @returns {number} total price
     */
    private getOrderPrice(order: IOrder) {
        return order.price * order.quantity;
    }

    private createCalculator(orderSide: OrderSide, side: OrderSide) {
        return (asset: string, calc: AssetCalc, priceQty: number) => {
            if (orderSide === side) calc(asset, priceQty);
        };
    }

    private createCalculators(order: IOrder) {
        return {
            ifBuy: this.createCalculator(order.side, OrderSide.BUY),
            ifSell: this.createCalculator(order.side, OrderSide.SELL),
        };
    }

    private add(asset: string, priceQty: number): number {
        return this.assets[asset] += priceQty;
    }

    private subtract(asset: string, priceQty: number): number {
        return this.assets[asset] -= priceQty;
    }

    private revertAssetReservation(order: IOrder): void {
        const [target, source] = order.pair;
        const {ifBuy, ifSell} = this.createCalculators(order);

        ifBuy(source, this.add, this.getOrderPrice(order));
        ifSell(target, this.add, order.quantity);
    }

    private reserveAsset(order: IOrder): void {
        const [target, source] = order.pair;
        const {ifBuy, ifSell} = this.createCalculators(order);

        ifBuy(source, this.subtract, this.getOrderPrice(order));
        ifSell(target, this.subtract, order.quantity);
    }

    private releaseAsset(order: IOrder): void {
        const [target, source] = order.pair;
        const {ifBuy, ifSell} = this.createCalculators(order);

        ifBuy(target, this.add, order.quantity); // release asset reservation
        ifSell(source, this.add, this.getOrderPrice(order)); // release asset reservation
    }

    /**
     * Updates the assets on the exchange for given new order
     * @param {IOrder} order new order
     * @param {IOrder} oldOrder old order
     */
    updateAssets(order: IOrder, oldOrder?: IOrder) {
        if (ReportType.REPLACED === order.reportType && oldOrder) {
            this.revertAssetReservation(oldOrder);
            this.reserveAsset(order);
        } else if (ReportType.NEW === order.reportType) {
            this.reserveAsset(order);
        } else if (ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status) {
            // @TODO what if order is partially filled?
            this.releaseAsset(order);
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            this.revertAssetReservation(order);
        }
    }
}
