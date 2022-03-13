create table candle_set
(
    id            int generated always as identity,
    interval      varchar not null,
    symbol        varchar not null,
    base_asset    varchar not null,
    quote_asset   varchar not null,
    tick_size      double precision,
    exchange      varchar not null,
    exchange_desc varchar,
    primary key (id)
);

create unique index candle_set_interval_symbol_exchange_index on candle_set (interval, symbol, exchange);

create table candles
(
    id            int generated always as identity,
    start         timestamptz      not null,
    open          double precision not null,
    high          double precision not null,
    low           double precision not null,
    close         double precision not null,
    volume        numeric          not null,
    fk_candle_set int,
    primary key (id),
    constraint fk_candle_set
        foreign key (fk_candle_set)
            references candle_set (id)
            on delete cascade
);

create table orders
(
    id                       int generated always as identity,
    symbol                   varchar,
    client_order_id          varchar,
    original_client_order_id varchar,
    price                    double precision,
    quantity                 double precision,
    status                   varchar,
    type                     varchar,
    side                     varchar,
    create_time              timestamptz,
    primary key (id)
);

create table trades
(
    id                       int generated always as identity,
    symbol                   varchar,
    client_order_id          varchar,
    original_client_order_id varchar,
    price                    double precision,
    quantity                 double precision,
    status                   varchar,
    side                     varchar,
    trade_quantity           double precision,
    commission               double precision,
    commission_asset         varchar,
    create_time              timestamptz,
    primary key (id)
);

create table trading_session
(
    id      int generated always as identity,
    session varchar not null,
    primary key (id)
);

create unique index trading_session_session_uindex on trading_session (session);
