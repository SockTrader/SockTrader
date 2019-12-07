import {TradeablePair} from "../sockTrader/core/types/TradeablePair";

export const ETHUSD: TradeablePair = {
    id: ["ETH", "USD"],
    quantityIncrement: 0.0001,
    tickSize: 0.001,
};

export const BTCUSD: TradeablePair = {
    id: ["BTC", "USD"],
    quantityIncrement: 0.00001,
    tickSize: 0.01,
};

export const DASHBTC: TradeablePair = {
    id: ["DASH", "BTC"],
    quantityIncrement: 0.001,
    tickSize: 0.000001,
};

export const DOGEBTC: TradeablePair = {
    id: ["DOGE", "BTC"],
    quantityIncrement: 10,
    tickSize: 0.00000000001,
};

export const ALL_CURRENCIES: TradeablePair[] = [ETHUSD, BTCUSD, DASHBTC, DOGEBTC];
