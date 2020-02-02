import {Logger} from "winston";

export interface PluginConfig {
    logRate: number;
}

export default class BasePlugin {

    private logger: Logger | undefined;
    private logQueue: Record<string, any> = {};
    private readonly releaseLogs: () => void;

    constructor(protected config?: PluginConfig) {
        if (config && config.logRate > 0) {
            setInterval(() => this.releaseQueue(), config.logRate);
            this.releaseLogs = () => undefined;
        } else {
            this.releaseLogs = () => this.releaseQueue();
        }
    }

    protected setLogger(logger: Logger) {
        this.logger = logger;
    }

    protected addLogToQueue(message: any) {
        if (message && message.type) {
            this.logQueue[message.type] = message;
        }
    }

    protected releaseQueue() {
        Object.values(this.logQueue).forEach((message) => {
            if (this.logger) this.logger.info(message);
        });

        this.logQueue = {};
    }

    protected log(message: any) {
        if (this.logger) {
            this.addLogToQueue(message);
            this.releaseLogs();
        }
    }
}
