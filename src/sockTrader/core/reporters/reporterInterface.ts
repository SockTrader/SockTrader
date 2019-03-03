import {IOrder} from "../types/order";

export type BotStatusType = "started" | "finished" | "progress";

export interface IBotStatus {
    current?: number;
    length?: number;
    type: BotStatusType;
}

/**
 * The IReporter represents a reporter to track
 * orders made by SockTrader
 */
export interface IReporter {

    /**
     * Async bot status report method
     * @param status
     */
    reportBotProgress(status: IBotStatus): Promise<void>;

    /**
     * Async order reportOrder
     * @param order
     */
    reportOrder(order: IOrder): Promise<void>;

}
