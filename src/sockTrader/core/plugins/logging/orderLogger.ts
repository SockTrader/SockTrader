import logger from "../../logger";
import {IOrder} from "../../types/order";
import {IReportAware} from "../../types/plugins/IReportAware";

export default class OrderLogger implements IReportAware {

    onReport({side, quantity, price, status}: IOrder) {
        logger.info(`Order: ${JSON.stringify({side, quantity, price, status})}`);
    }

}
