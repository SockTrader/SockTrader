import {BotStatus} from "../botStatus";

export interface TradingBotAware {
    onBotProgress: (status: BotStatus) => void;
}

export const isTradingBotAware = (plugin: any): plugin is TradingBotAware => plugin.onBotProgress !== undefined;
