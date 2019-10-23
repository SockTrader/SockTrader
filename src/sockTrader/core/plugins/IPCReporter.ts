import {IBotStatus} from "../types/IBotStatus";
import {IOrder} from "../types/order";
import {IReportAware} from "../types/plugins/IReportAware";
import {ITradingBotAware} from "../types/plugins/ITradingBotAware";

export default class IPCReporter implements ITradingBotAware, IReportAware {

    private send(message: { payload: any, type: string }): void {
        if (!process.send) throw new Error("Cannot use IPCReporter. SockTrader is not running as a child process.");
        process.send(message);
    }

    onBotProgress(status: IBotStatus) {
        this.send({type: "status_report", payload: status});
    }

    onReport(order: IOrder) {
        this.send({type: "order_report", payload: order});
    }
}
