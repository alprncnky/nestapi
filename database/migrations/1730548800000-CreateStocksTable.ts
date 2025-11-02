import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Create Stocks Table Migration
 * 
 * Creates the stocks table for storing stock market data from various exchanges
 * Supports BIST 100, Nasdaq, and other market types
 */
export class CreateStocksTable1730548800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create stocks table
    await queryRunner.query(`
      CREATE TABLE "stocks" (
        "id" SERIAL NOT NULL,
        "symbol" character varying(10) NOT NULL,
        "name" character varying(255) NOT NULL,
        "last_price" numeric(18,4) NOT NULL,
        "highest_price" numeric(18,4) NOT NULL,
        "lowest_price" numeric(18,4) NOT NULL,
        "volume" numeric(20,2) NOT NULL,
        "market_type" integer NOT NULL,
        "daily_percent" numeric(10,4),
        "weekly_percent" numeric(10,4),
        "monthly_percent" numeric(10,4),
        "yearly_percent" numeric(10,4),
        "fetched_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stocks" PRIMARY KEY ("id")
      )
    `);

    // Create index for symbol and market type combination
    await queryRunner.query(`
      CREATE INDEX "idx_symbol_market_type" ON "stocks" ("symbol", "market_type")
    `);

    // Create index for market type
    await queryRunner.query(`
      CREATE INDEX "idx_market_type" ON "stocks" ("market_type")
    `);

    // Create index for fetched_at (for time-based queries)
    await queryRunner.query(`
      CREATE INDEX "idx_fetched_at" ON "stocks" ("fetched_at")
    `);

    // Add comment to table
    await queryRunner.query(`
      COMMENT ON TABLE "stocks" IS 'Stores stock market data from various exchanges (BIST100, Nasdaq, etc.)'
    `);

    // Add comments to important columns
    await queryRunner.query(`
      COMMENT ON COLUMN "stocks"."market_type" IS 'Market type: 1=BIST100, 2=Nasdaq'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fetched_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_market_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_symbol_market_type"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "stocks"`);
  }
}

