# Database Cleanup Instructions

## Step 1: Run the Cleanup Script

Execute the SQL cleanup script to drop all existing tables and database objects:

```bash
# Option 1: Using psql command line
psql -h localhost -U postgres -d insdb -f database/cleanup-database.sql

# Option 2: Using psql with password prompt
PGPASSWORD=your_password psql -h localhost -U postgres -d insdb -f database/cleanup-database.sql

# Option 3: Connect to psql first, then run the file
psql -h localhost -U postgres -d insdb
\i database/cleanup-database.sql
```

**IMPORTANT:** Make sure to update the connection details (host, username, database name) according to your `.env.development` file.

## Step 2: Verify the Cleanup

After running the script, the last two queries will show:
- Any remaining tables (should be empty or only system tables)
- Any remaining enum types (should be empty)

## Step 3: Fix the Stock Schema Issue

There's a bug in the Stock schema where index column names use snake_case but the actual columns use camelCase. This needs to be fixed before creating new migrations.

**File:** `src/modules/stocks/data/schemas/stock.schema.ts`

**Change lines 26-30 from:**
```typescript
indices: [
  { name: 'idx_symbol_market_type', columns: ['symbol', 'market_type'] },
  { name: 'idx_market_type', columns: ['market_type'] },
  { name: 'idx_fetched_at', columns: ['fetched_at'] },
],
```

**To:**
```typescript
indices: [
  { name: 'idx_symbol_market_type', columns: ['symbol', 'marketType'] },
  { name: 'idx_market_type', columns: ['marketType'] },
  { name: 'idx_fetched_at', columns: ['fetchedAt'] },
],
```

## Step 4: Delete All Migration Files

After the database is clean and the schema is fixed, delete all existing migration files:

```bash
rm database/migrations/*.ts
```

Keep only the `.gitkeep` file if it exists.

## Step 5: Generate New Clean Migration

Generate a fresh migration that will create all necessary tables:

```bash
npm run migration:generate -- database/migrations/InitialSetup
```

This will create a new migration file with all the current entities (stocks, rss_sources, job_execution_history).

## Step 6: Run the New Migration

```bash
npm run migration:run
```

## Step 7: Verify the Application

Start the application to verify everything works:

```bash
npm run start:dev
```

---

## Current Database Connection Info

Based on your configuration, you should use:
- **Host:** Check `DB_HOST` in `.env.development`
- **Port:** Check `DB_PORT` in `.env.development` (default: 5432)
- **Username:** Check `DB_USERNAME` in `.env.development` (default: postgres)
- **Password:** Check `DB_PASSWORD` in `.env.development`
- **Database:** Check `DB_NAME` in `.env.development` (default: insdb)

---

## What Will Remain After Cleanup

After all steps are complete, your database will have only these tables:
1. **rss_sources** - RSS feed sources
2. **stocks** - Stock market data
3. **job_execution_history** - Job execution tracking
4. **migrations** - TypeORM migrations tracking

All old tables (news, stock-prices, stock-prediction, reliability tracking, etc.) will be completely removed.

