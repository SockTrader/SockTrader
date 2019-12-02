import {IBotStatus} from "../IBotStatus";

export interface ITradingBotAware {
    onBotProgress: (status: IBotStatus) => void;
}

export const isTradingBotAware = (plugin: any): plugin is ITradingBotAware => plugin.onBotProgress !== undefined;
