import {orderbookLogger} from "../../logger";
import Orderbook, {OrderbookEntry, OrderbookSide} from "../../orderbook/orderbook";
import {OrderbookAware} from "../../types/plugins/orderbookAware";
import OrderbookUtil from "../../utils/orderbookUtil";

export default class SpreadLogger implements OrderbookAware {

    private lastSpread = 0;

    onUpdateOrderbook(orderbook: Orderbook) {
        const bid: OrderbookEntry = orderbook.getEntries(OrderbookSide.BID, 1)[0];
        const ask: OrderbookEntry = orderbook.getEntries(OrderbookSide.ASK, 1)[0];
        const spread: number = OrderbookUtil.getBidAskSpreadPerc(bid.price, ask.price);

        if (spread !== this.lastSpread) {
            orderbookLogger.info({type: "Orderbook", spread, bid: bid.price, ask: ask.price});
        }

        this.lastSpread = spread;
    }

}
