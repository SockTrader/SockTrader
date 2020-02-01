import {orderLogger} from "../../loggerFactory";
import {Order} from "../../types/order";
import BasePlugin from "../basePlugin";

export default class OrderLogger extends BasePlugin {

    constructor() {
        super();
        this.onEvent("core.report", this.onReport.bind(this));
    }

    onReport(order: Order) {
        orderLogger.info({type: "Order", payload: order});
    }

}
