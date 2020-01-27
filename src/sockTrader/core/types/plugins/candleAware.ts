import {Candle} from "../candle";

export interface CandleAware {
    onUpdateCandles(candles: Candle[]): void;
}

export const isCandleAware = (plugin: any): plugin is CandleAware => plugin.onUpdateAssets !== undefined;
