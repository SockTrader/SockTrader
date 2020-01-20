import {orderLogger} from "../../loggerFactory";
import {Order} from "../../types/order";
import {ReportAware} from "../../types/plugins/reportAware";

export default class OrderLogger implements ReportAware {

    onReport(order: Order) {
        orderLogger.info({type: "Order", payload: order});
    }

}
