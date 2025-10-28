export const SQLQueries = {
  findBySymbolAndDateRange: `
    SELECT 
        sp.id,
        sp.stock_symbol,
        sp.stock_name,
        sp.open,
        sp.close,
        sp.high,
        sp.low,
        sp.last,
        sp.daily_change_price,
        sp.daily_change_percent,
        sp.volume_turkish_lira,
        sp.volume_lot,
        sp.volatility,
        sp.exchange,
        sp.currency,
        sp.last_update,
        sp.fetched_at,
        sp.created_at,
        sp.updated_at
    FROM stock_prices sp
    WHERE sp.stock_symbol = $1
      AND sp.last_update BETWEEN $2 AND $3
    ORDER BY sp.last_update ASC
  ` as const,

  findLatestBySymbol: `
    SELECT 
        sp.id,
        sp.stock_symbol,
        sp.stock_name,
        sp.open,
        sp.close,
        sp.high,
        sp.low,
        sp.last,
        sp.daily_change_price,
        sp.daily_change_percent,
        sp.volume_turkish_lira,
        sp.volume_lot,
        sp.volatility,
        sp.exchange,
        sp.currency,
        sp.last_update,
        sp.fetched_at,
        sp.created_at,
        sp.updated_at
    FROM stock_prices sp
    WHERE sp.stock_symbol = $1
    ORDER BY sp.fetched_at DESC
    LIMIT 1
  ` as const,

  findAllLatest: `
    SELECT DISTINCT ON (sp.stock_symbol)
        sp.id,
        sp.stock_symbol,
        sp.stock_name,
        sp.open,
        sp.close,
        sp.high,
        sp.low,
        sp.last,
        sp.daily_change_price,
        sp.daily_change_percent,
        sp.volume_turkish_lira,
        sp.volume_lot,
        sp.volatility,
        sp.exchange,
        sp.currency,
        sp.last_update,
        sp.fetched_at,
        sp.created_at,
        sp.updated_at
    FROM stock_prices sp
    ORDER BY sp.stock_symbol ASC, sp.fetched_at DESC
  ` as const,
} as const;
