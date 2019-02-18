import {IOrder} from "../types/order";
import {IReporter} from "./reporterInterface";

export default class IPCReporter implements IReporter {

    async report(order: IOrder): Promise<void> {
        if (!process.send) {
            throw new Error("Process is not running as a child process");
        }

        return process.send(order);
    }
}
