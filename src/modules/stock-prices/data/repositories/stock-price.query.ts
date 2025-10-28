export const SQLQueries = {
  findBySymbolAndDateRange: `
    SELECT 
        sp.id,
        sp."stockSymbol",
        sp."stockName",
        sp.open,
        sp.close,
        sp.high,
        sp.low,
        sp.last,
        sp."dailyChangePrice",
        sp."dailyChangePercent",
        sp."volumeTurkishLira",
        sp."volumeLot",
        sp.volatility,
        sp.exchange,
        sp.currency,
        sp."lastUpdate",
        sp."fetchedAt",
        sp."createdAt",
        sp."updatedAt"
    FROM stock_prices sp
    WHERE sp."stockSymbol" = $1
      AND sp."lastUpdate" BETWEEN $2 AND $3
    ORDER BY sp."lastUpdate" ASC
  ` as const,

  findLatestBySymbol: `
    SELECT 
        sp.id,
        sp."stockSymbol",
        sp."stockName",
        sp.open,
        sp.close,
        sp.high,
        sp.low,
        sp.last,
        sp."dailyChangePrice",
        sp."dailyChangePercent",
        sp."volumeTurkishLira",
        sp."volumeLot",
        sp.volatility,
        sp.exchange,
        sp.currency,
        sp."lastUpdate",
        sp."fetchedAt",
        sp."createdAt",
        sp."updatedAt"
    FROM stock_prices sp
    WHERE sp."stockSymbol" = $1
    ORDER BY sp."fetchedAt" DESC
    LIMIT 1
  ` as const,

  findAllLatest: `
    SELECT DISTINCT ON (sp."stockSymbol")
        sp.id,
        sp."stockSymbol",
        sp."stockName",
        sp.open,
        sp.close,
        sp.high,
        sp.low,
        sp.last,
        sp."dailyChangePrice",
        sp."dailyChangePercent",
        sp."volumeTurkishLira",
        sp."volumeLot",
        sp.volatility,
        sp.exchange,
        sp.currency,
        sp."lastUpdate",
        sp."fetchedAt",
        sp."createdAt",
        sp."updatedAt"
    FROM stock_prices sp
    ORDER BY sp."stockSymbol" ASC, sp."fetchedAt" DESC
  ` as const,
} as const;
