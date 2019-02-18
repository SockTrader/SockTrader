import {IOrder} from "../types/order";

/**
 * The IReporter represents a reporter to track
 * orders made by SockTrader
 */
export interface IReporter {

    /**
     * Async order report
     * @param order
     */
    report(order: IOrder): Promise<void>;

}
