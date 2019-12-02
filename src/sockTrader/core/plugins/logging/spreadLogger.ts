import {orderbookLogger} from "../../logger";
import Orderbook, {OrderbookEntry, OrderbookSide} from "../../orderbook";
import {OrderbookAware} from "../../types/plugins/OrderbookAware";

export default class SpreadLogger implements OrderbookAware {

    private lastSpread = 0;

    onUpdateOrderbook(orderbook: Orderbook) {
        const bidEntry: OrderbookEntry = orderbook.getEntries(OrderbookSide.BID, 1)[0];
        const askEntry: OrderbookEntry = orderbook.getEntries(OrderbookSide.ASK, 1)[0];
        const incrPerc: number = Orderbook.getBidAskSpreadPerc(bidEntry.price, askEntry.price);

        if (incrPerc !== this.lastSpread) {
            orderbookLogger.info(`${incrPerc} BID: ${bidEntry.price} ASK: ${askEntry.price}`);
        }

        this.lastSpread = incrPerc;
    }

}
