export type BotStatusType = "started" | "finished" | "progress";

export interface IBotStatus {
    current?: number;
    length?: number;
    type: BotStatusType;
}
