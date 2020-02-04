import {Order, OrderSide} from "../../types/order";
import BaseCommand from "./baseCommand";

export class ReleaseCommand extends BaseCommand {

    apply(order: Order): void {
        const {price, quantity, pair: [quote, base]} = order;

        if (order.side === OrderSide.BUY) {
            this.assets.addAsset(quote, quantity);
            this.reservedAssets.subtractAsset(base, price * quantity);
        } else {
            this.assets.addAsset(base, price * quantity);
            this.reservedAssets.subtractAsset(quote, quantity);
        }
    }

    revert(): void {
        throw new Error("Asset release cannot be reverted.");
    }
}
