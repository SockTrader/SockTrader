import {orderbookLogger} from "../../loggerFactory";
import Orderbook, {OrderbookEntry, OrderbookSide} from "../../orderbook/orderbook";
import OrderbookUtil from "../../utils/orderbookUtil";
import Events from "../../events";

export default class SpreadLogger {

    private lastSpread = 0;

    constructor() {
        Events.on("core.updateOrderbook", this.onUpdateOrderbook.bind(this));
    }

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
