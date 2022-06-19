import { BinanceCandleOptions, LocalExchangeCandleOptions } from '../exchanges'

export interface Strategy {
  onStart(): void;
  onStop?(): void;
}

export type CandleOptions = LocalExchangeCandleOptions | BinanceCandleOptions
