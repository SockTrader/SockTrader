import {BotStatus} from "../../types/botStatus";
import {Order} from "../../types/order";
import Events from "../../events";

export default class IPC {

    constructor() {
        Events.on("core.botStatus", this.onBotProgress.bind(this));
        Events.on("core.report", this.onReport.bind(this));
    }

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
