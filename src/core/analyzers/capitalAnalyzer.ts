import {IOrder, OrderSide, OrderStatus} from "../types/order";

export interface IAnalyzer {
    analyze(order: IOrder): void;
}

/**
 * The CapitalAnalyzer calculates wins ans losses made by using the orders
 * your strategy placed
 */
export default class CapitalAnalyzer implements IAnalyzer {

    /**
     * Creates a new CapitalAnalyzer
     * @param {number} startCapital your starting capital
     */
    constructor(private startCapital: number) {
        // TODO do something with starting capital
    }

    /**
     * Calculates your new capital based on a fulfilled order and compares
     * it to your old capital
     * @param {IOrder} order fulfilled order
     */
    analyze(order: IOrder) {
        if (order.status !== OrderStatus.FILLED) {
            return;
        }

        const oldCapital = this.startCapital;
        if (order.side === OrderSide.BUY) {
            this.startCapital -= (order.price * order.quantity);
        } else if (order.side === OrderSide.SELL) {
            this.startCapital += (order.price * order.quantity);
        }

        console.log("capital: ", this.startCapital, " : ", this.calcPerc(oldCapital, this.startCapital), "\n");
    }

    /**
     * Calculates percentage gain or loss
     * @param {number} a old capital
     * @param {number} b new capital
     * @returns {string} percentage gain or loss
     */
    calcPerc(a: number, b: number): string {
        if (b > a) {
            return `+${(b - a) / a * 100}%`;
        } else {
            return `-${(b - a) / b * 100}%`;
        }
    }
}
