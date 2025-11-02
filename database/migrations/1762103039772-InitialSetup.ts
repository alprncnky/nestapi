import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1762103039772 implements MigrationInterface {
    name = 'InitialSetup1762103039772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rss_sources_feedtype_enum" AS ENUM('RSS2', 'ATOM', 'JSON')`);
        await queryRunner.query(`CREATE TYPE "public"."rss_sources_category_enum" AS ENUM('COMPANY_NEWS', 'ECONOMY', 'SECTOR_NEWS', 'INTERNATIONAL', 'POLICY', 'FINANCIAL_MARKETS')`);
        await queryRunner.query(`CREATE TABLE "rss_sources" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "url" character varying NOT NULL, "feedType" "public"."rss_sources_feedtype_enum" NOT NULL DEFAULT 'RSS2', "category" "public"."rss_sources_category_enum" NOT NULL, "country" character varying(10) NOT NULL DEFAULT 'TR', "reliabilityScore" numeric(5,2) NOT NULL DEFAULT '50', "isActive" boolean NOT NULL DEFAULT true, "fetchInterval" integer NOT NULL DEFAULT '30', "lastFetchedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6c322599045e57174b34c395b4b" UNIQUE ("url"), CONSTRAINT "PK_1d62d714d6fd7d0241d1f6d260a" PRIMARY KEY ("id")); COMMENT ON COLUMN "rss_sources"."fetchInterval" IS 'Fetch interval in minutes'`);
        await queryRunner.query(`CREATE TYPE "public"."stocks_markettype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "stocks" ("id" SERIAL NOT NULL, "symbol" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "lastPrice" numeric(18,4) NOT NULL, "highestPrice" numeric(18,4) NOT NULL, "lowestPrice" numeric(18,4) NOT NULL, "volume" numeric(20,2) NOT NULL, "marketType" "public"."stocks_markettype_enum" NOT NULL, "dailyPercent" numeric(10,4), "weeklyPercent" numeric(10,4), "monthlyPercent" numeric(10,4), "yearlyPercent" numeric(10,4), "fetchedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b5b1ee4ac914767229337974575" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_symbol_market_type" ON "stocks" ("symbol", "marketType") `);
        await queryRunner.query(`CREATE INDEX "idx_market_type" ON "stocks" ("marketType") `);
        await queryRunner.query(`CREATE INDEX "idx_fetched_at" ON "stocks" ("fetchedAt") `);
        await queryRunner.query(`CREATE TYPE "public"."job_execution_history_status_enum" AS ENUM('SUCCESS', 'FAILED', 'SKIPPED')`);
        await queryRunner.query(`CREATE TABLE "job_execution_history" ("id" SERIAL NOT NULL, "jobName" character varying(255) NOT NULL, "status" "public"."job_execution_history_status_enum" NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP, "duration" integer, "errorMessage" text, "errorStack" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c4c02d9ad99478ed4255841386a" PRIMARY KEY ("id")); COMMENT ON COLUMN "job_execution_history"."duration" IS 'Duration in milliseconds'`);
        await queryRunner.query(`CREATE INDEX "IDX_job_execution_history_job_name" ON "job_execution_history" ("jobName") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_execution_history_start_time" ON "job_execution_history" ("startTime") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_execution_history_status" ON "job_execution_history" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_job_execution_history_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_execution_history_start_time"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_execution_history_job_name"`);
        await queryRunner.query(`DROP TABLE "job_execution_history"`);
        await queryRunner.query(`DROP TYPE "public"."job_execution_history_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_fetched_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_market_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_symbol_market_type"`);
        await queryRunner.query(`DROP TABLE "stocks"`);
        await queryRunner.query(`DROP TYPE "public"."stocks_markettype_enum"`);
        await queryRunner.query(`DROP TABLE "rss_sources"`);
        await queryRunner.query(`DROP TYPE "public"."rss_sources_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."rss_sources_feedtype_enum"`);
    }

}
