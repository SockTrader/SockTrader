import {TradeablePair} from "../sockTrader/core/types/tradeablePair";

export const FX_ETHUSD: TradeablePair = {
    id: ["ETH", "USD"],
    quantityIncrement: 0.0001,
    tickSize: 0.001,
};

export const FX_BTCUSD: TradeablePair = {
    id: ["BTC", "USD"],
    quantityIncrement: 0.00001,
    tickSize: 0.01,
};

export const FX_DASHBTC: TradeablePair = {
    id: ["DASH", "BTC"],
    quantityIncrement: 0.001,
    tickSize: 0.000001,
};

export const FX_DOGEBTC: TradeablePair = {
    id: ["DOGE", "BTC"],
    quantityIncrement: 10,
    tickSize: 0.00000000001,
};

export const FX_ALL_CURRENCIES: TradeablePair[] = [FX_ETHUSD, FX_BTCUSD, FX_DASHBTC, FX_DOGEBTC];
