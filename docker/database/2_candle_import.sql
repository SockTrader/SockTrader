-- Create new candle set
insert into candleSet (id, interval, symbol, exchange) values (default, '1h', 'BTCUSD', 'coinbase');

-- @TODO link candle to candleSet

-- Add temporary column
alter table candles add "timeTmp" varchar;

-- Map each consecutive column in csv file to a column in the candles table
copy candles ("timeTmp", symbol, open, high, low, close, volume, "quoteVolume")
    from '/docker-entrypoint-initdb.d/coinbase_btcusd_1h.csv' delimiter ',' CSV HEADER;

-- Format temporary column into "start"
update candles set start = to_timestamp("timeTmp", 'YYYY-MM-DD HH:PM');

-- Remove temporary column
alter table candles drop column "timeTmp";
