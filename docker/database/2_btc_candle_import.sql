-- Create new candle set
insert into candle_set (id, interval, symbol, base_asset, quote_asset, tick_size, exchange, exchange_desc)
values (default, '1h', 'BTCUSD', 'BTC', 'USD', 0.01000000, 'coinbase', 'coinbase exchange');

-- Create temporary candle table
create table tmp_candles
(
    time_tmp     varchar,
    symbol       varchar,
    open         double precision,
    high         double precision,
    low          double precision,
    close        double precision,
    volume       numeric,
    quote_volume numeric
);

-- Map each consecutive column in csv file to a column in the tmp_candles table
copy tmp_candles (time_tmp, symbol, open, high, low, close, volume, quote_volume)
from '/docker-entrypoint-initdb.d/coinbase_btcusd_1h.csv' delimiter ',' CSV HEADER;

-- Import temporary table into candles table
insert into candles (start, open, high, low, close, volume, fk_candle_set)
select to_timestamp(time_tmp, 'YYYY-MM-DD HH:PM'),
       open,
       high,
       low,
       close,
       volume,
       (SELECT id FROM candle_set WHERE symbol = 'BTCUSD')
from tmp_candles;

-- Remove temporary table
drop table tmp_candles;
