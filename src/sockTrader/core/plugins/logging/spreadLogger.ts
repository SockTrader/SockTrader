import {orderbookLogger} from "../../logger";
import Orderbook, {IOrderbook, IOrderbookEntry, OrderbookSide} from "../../orderbook";
import {IOrderbookAware} from "../../types/plugins/IOrderbookAware";

export default class SpreadLogger implements IOrderbookAware {

    private lastSpread = 0;

    onUpdateOrderbook(orderbook: IOrderbook) {
        const bidEntry: IOrderbookEntry = orderbook.getEntries(OrderbookSide.BID, 1)[0];
        const askEntry: IOrderbookEntry = orderbook.getEntries(OrderbookSide.ASK, 1)[0];
        const incrPerc: number = Orderbook.getBidAskSpreadPerc(bidEntry.price, askEntry.price);

        if (incrPerc !== this.lastSpread) {
            orderbookLogger.info(`${incrPerc} BID: ${bidEntry.price} ASK: ${askEntry.price}`);
        }

        this.lastSpread = incrPerc;
    }

}
