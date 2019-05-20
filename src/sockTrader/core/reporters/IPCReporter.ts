import {IOrder} from "../types/order";
import {IBotStatus, IReporter} from "./reporterInterface";

export default class IPCReporter implements IReporter {

    async reportBotProgress(status: IBotStatus): Promise<void> {
        return this.send({type: "status_report", payload: status});
    }

    async reportOrder(order: IOrder): Promise<void> {
        return this.send({type: "order_report", payload: order});
    }

    private send(message: { payload: any, type: string }): void {
        if (!process.send) throw new Error("Cannot use IPCReporter. SockTrader is not running as a child process.");
        process.send(message);
    }
}
