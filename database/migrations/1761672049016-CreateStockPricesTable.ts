import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStockPricesTable1761672049016 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "stock_prices" (
                "id" SERIAL NOT NULL,
                "stockSymbol" character varying(10) NOT NULL,
                "stockName" character varying(255),
                "open" numeric(18,4) NOT NULL,
                "close" numeric(18,4) NOT NULL,
                "high" numeric(18,4) NOT NULL,
                "low" numeric(18,4) NOT NULL,
                "last" numeric(18,4) NOT NULL,
                "dailyChangePrice" numeric(18,4) NOT NULL,
                "dailyChangePercent" numeric(10,4) NOT NULL,
                "volumeTurkishLira" numeric(20,2) NOT NULL,
                "volumeLot" bigint NOT NULL,
                "volatility" numeric(10,4) NOT NULL,
                "exchange" character varying(50) NOT NULL DEFAULT 'BIST100',
                "currency" character varying(10) NOT NULL DEFAULT 'TRY',
                "lastUpdate" TIMESTAMP NOT NULL,
                "fetchedAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_stock_prices" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_stock_symbol_date" ON "stock_prices" ("stockSymbol", "lastUpdate")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_fetched_at" ON "stock_prices" ("fetchedAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_fetched_at"`);
        await queryRunner.query(`DROP INDEX "IDX_stock_symbol_date"`);
        await queryRunner.query(`DROP TABLE "stock_prices"`);
    }

}
