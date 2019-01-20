import {IOrder, OrderSide, OrderStatus, ReportType} from "./orderInterface";

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
     * Updates the assets on the exchange for given new order
     * @param {IOrder} order new order
     * @param {IOrder} oldOrder old order
     */
    updateAssets(order: IOrder, oldOrder?: IOrder) {
        const [target, source] = order.pair;

        const ifBuy = this.createCalculator(order.side, OrderSide.BUY);
        const ifSell = this.createCalculator(order.side, OrderSide.SELL);

        if (ReportType.REPLACED === order.reportType && oldOrder) {
            ifBuy(source, this.add, this.getOrderPrice(oldOrder));
            ifBuy(source, this.subtract, this.getOrderPrice(order));
            ifSell(target, this.add, oldOrder.quantity);
            ifSell(target, this.subtract, order.quantity);
        } else if (ReportType.NEW === order.reportType) {
            ifBuy(source, this.subtract, this.getOrderPrice(order));
            ifSell(target, this.subtract, order.quantity);
        } else if (ReportType.TRADE === order.reportType && OrderStatus.FILLED === order.status) {
            ifBuy(target, this.add, order.quantity);
            ifSell(source, this.add, this.getOrderPrice(order));
        } else if ([ReportType.CANCELED, ReportType.EXPIRED, ReportType.SUSPENDED].indexOf(order.reportType) > -1) {
            ifBuy(source, this.add, this.getOrderPrice(order));
            ifSell(target, this.add, order.quantity);
        }
    }

    private add: AssetCalc = (asset: string, priceQty: number) => this.assets[asset] += priceQty;

    private createCalculator(orderSide: OrderSide, side: OrderSide) {
        return (asset: string, calc: AssetCalc, priceQty: number) => {
            if (orderSide === side) calc(asset, priceQty);
        };
    }

    /**
     * Calculates total price of order
     * @param {IOrder} order the order
     * @returns {number} total price
     */
    private getOrderPrice(order: IOrder) {
        return order.price * order.quantity;
    }

    private subtract: AssetCalc = (asset: string, priceQty: number) => this.assets[asset] -= priceQty;
}
