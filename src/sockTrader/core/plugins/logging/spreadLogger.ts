import {orderbookLogger} from "../../logger";
import Orderbook, {OrderbookEntry, OrderbookSide} from "../../orderbook/orderbook";
import {OrderbookAware} from "../../types/plugins/orderbookAware";
import OrderbookUtil from "../../utils/orderbookUtil";

export default class SpreadLogger implements OrderbookAware {

    private lastSpread = 0;

    onUpdateOrderbook(orderbook: Orderbook) {
        const bidEntry: OrderbookEntry = orderbook.getEntries(OrderbookSide.BID, 1)[0];
        const askEntry: OrderbookEntry = orderbook.getEntries(OrderbookSide.ASK, 1)[0];
        const incrPerc: number = OrderbookUtil.getBidAskSpreadPerc(bidEntry.price, askEntry.price);

        if (incrPerc !== this.lastSpread) {
            orderbookLogger.info(`${incrPerc} BID: ${bidEntry.price} ASK: ${askEntry.price}`);
        }

        this.lastSpread = incrPerc;
    }

}
