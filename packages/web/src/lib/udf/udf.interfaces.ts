export interface UDFSymbol {
  symbol: string;
  ticker: string;
  name: string;
  full_name: string;
  description: string;
  exchange: string;
  listed_exchange: string;
  type: 'crypto';
  currency_code: string;
  session: '24x7';
  timezone: 'UTC';
  minmovement: number;
  minmov: number;
  minmovement2: number;
  minmov2: number;
  pricescale: number;
  supported_resolutions: string[];
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  data_status: 'streaming';
}
