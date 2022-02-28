create table "candleSet"
(
    id       serial constraint candleset_pk primary key,
    interval varchar not null,
    symbol   varchar not null,
    exchange varchar
);

create index candleset_interval_symbol_index on "candleSet" (interval, symbol);

create table candles
(
    id            serial constraint candles_pk primary key,
    start         timestamp,
    symbol        varchar,
    open          double precision,
    high          double precision,
    low           double precision,
    close         double precision,
    volume        numeric,
    "quoteVolume" numeric
);

create table orders
(
    id                      serial constraint orders_pk primary key,
    symbol                  varchar,
    "clientOrderId"         varchar,
    "originalClientOrderId" varchar,
    price                   double precision,
    quantity                double precision,
    status                  varchar,
    type                    varchar,
    side                    varchar,
    "createTime"            timestamptz
);

create table trades
(
    id                      serial constraint trades_pk primary key,
    symbol                  varchar,
    "clientOrderId"         varchar,
    "originalClientOrderId" varchar,
    price                   double precision,
    quantity                double precision,
    status                  varchar,
    side                    varchar,
    "tradeQuantity"         double precision,
    commission              double precision,
    "commissionAsset"       varchar,
    "createTime"            timestamptz
);

create table "tradingSession"
(
    id      serial constraint tradingsession_pk primary key,
    session varchar not null
);

create unique index tradingsession_session_uindex on "tradingSession" (session);
