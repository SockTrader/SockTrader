import logger from "../../logger";
import {Order} from "../../types/order";
import {ReportAware} from "../../types/plugins/reportAware";

export default class OrderLogger implements ReportAware {

    onReport({side, quantity, price, status}: Order) {
        logger.info(`Order: ${JSON.stringify({side, quantity, price, status})}`);
    }

}
