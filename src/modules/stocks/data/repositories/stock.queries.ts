export const SQLQueries = {
  findLatestByMarketType: `
    SELECT 
      s.id,
      s.symbol,
      s.name,
      s."lastPrice",
      s."highestPrice",
      s."lowestPrice",
      s.volume,
      s."marketType",
      s."dailyPercent",
      s."weeklyPercent",
      s."monthlyPercent",
      s."yearlyPercent",
      s."fetchedAt",
      s."createdAt",
      s."updatedAt"
    FROM stocks s
    WHERE s."marketType" = $1
    ORDER BY s."fetchedAt" DESC, s.symbol ASC
  ` as const,

  deleteOlderThan: `
    DELETE FROM stocks
    WHERE "fetchedAt" < $1
  ` as const,
} as const;

