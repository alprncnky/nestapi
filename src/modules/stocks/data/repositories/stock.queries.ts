export const SQLQueries = {
  findLatestByMarketType: `
    SELECT 
      s.id,
      s.symbol,
      s.name,
      s.last_price as "lastPrice",
      s.highest_price as "highestPrice",
      s.lowest_price as "lowestPrice",
      s.volume,
      s.market_type as "marketType",
      s.daily_percent as "dailyPercent",
      s.weekly_percent as "weeklyPercent",
      s.monthly_percent as "monthlyPercent",
      s.yearly_percent as "yearlyPercent",
      s.fetched_at as "fetchedAt",
      s.created_at as "createdAt",
      s.updated_at as "updatedAt"
    FROM stocks s
    WHERE s.market_type = $1
    ORDER BY s.fetched_at DESC, s.symbol ASC
  ` as const,

  deleteOlderThan: `
    DELETE FROM stocks
    WHERE fetched_at < $1
  ` as const,
} as const;

