import {Order, OrderSide} from "../../types/order";
import BaseCommand from "./baseCommand";

export class ReserveCommand extends BaseCommand {

    apply(order: Order): void {
        const {price, quantity, pair: [quote, base]} = order;

        if (order.side === OrderSide.BUY) {
            this.assets.subtractAsset(base, price * quantity);
            this.reservedAssets.addAsset(base, price * quantity);
        } else {
            this.assets.subtractAsset(quote, quantity);
            this.reservedAssets.addAsset(quote, quantity);
        }
    }

    revert(order: Order): void {
        const {price, quantity, pair: [quote, base]} = order;

        if (order.side === OrderSide.BUY) {
            this.assets.addAsset(base, price * quantity);
            this.reservedAssets.subtractAsset(base, price * quantity);
        } else {
            this.assets.addAsset(quote, quantity);
            this.reservedAssets.subtractAsset(quote, quantity);
        }
    }

}
