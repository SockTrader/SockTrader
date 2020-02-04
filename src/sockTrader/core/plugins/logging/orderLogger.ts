import {orderLogger} from "../../loggerFactory";
import {Order} from "../../types/order";
import Events from "../../events";

export default class OrderLogger {

    constructor() {
        Events.on("core.report", this.onReport.bind(this));
    }

    onReport(order: Order) {
        orderLogger.info({type: "Order", payload: order});
    }

}
