import {BotStatus} from "../BotStatus";

export interface TradingBotAware {
    onBotProgress: (status: BotStatus) => void;
}

export const isTradingBotAware = (plugin: any): plugin is TradingBotAware => plugin.onBotProgress !== undefined;
