import {BotStatus} from "../types/botStatus";
import {Order} from "../types/order";
import {ReportAware} from "../types/plugins/reportAware";
import {TradingBotAware} from "../types/plugins/tradingBotAware";

export default class IPCReporter implements TradingBotAware, ReportAware {

    private send(message: { payload: any; type: string }): void {
        if (process.send) process.send(message);
    }

    onBotProgress(status: BotStatus) {
        this.send({type: "status_report", payload: status});
    }

    onReport(order: Order) {
        this.send({type: "order_report", payload: order});
    }
}
