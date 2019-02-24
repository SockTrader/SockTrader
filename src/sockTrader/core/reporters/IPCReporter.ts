import {IOrder} from "../types/order";
import {IBotStatus, IReporter} from "./reporterInterface";

export default class IPCReporter implements IReporter {

    async reportBotProgress(status: IBotStatus): Promise<void> {
        return IPCReporter.send({type: "status_report", payload: status});
    }

    async reportOrder(order: IOrder): Promise<void> {
        return IPCReporter.send({type: "order_report", payload: order});
    }

    private static send(message: { payload: any, type: string, }): void {
        if (!process.send) throw new Error("Process is not running as a child process");
        return process.send(message);
    }
}
