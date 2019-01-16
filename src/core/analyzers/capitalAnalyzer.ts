import {IOrder, OrderSide, OrderStatus} from "../orderInterface";

export interface IAnalyzer {
    analyze(order: IOrder): void;
}

export default class CapitalAnalyzer implements IAnalyzer {

    constructor(private startCapital: number) {

    }

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

    calcPerc(a: number, b: number): string {
        if (b > a) {
            return `+${(b - a) / a * 100}%`;
        } else {
            return `-${(b - a) / b * 100}%`;
        }
    }
}
