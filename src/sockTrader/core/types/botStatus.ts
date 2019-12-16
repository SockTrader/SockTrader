export type BotStatusType = "started" | "finished" | "progress";

export interface BotStatus {
    current?: number;
    length?: number;
    type: BotStatusType;
}
