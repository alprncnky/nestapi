import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStockPredictionTables1761681937300 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create prediction_rules table
        await queryRunner.query(`
            CREATE TABLE "prediction_rules" (
                "id" SERIAL NOT NULL,
                "ruleType" character varying(50) NOT NULL,
                "ruleValue" character varying(255) NOT NULL,
                "totalPredictions" integer NOT NULL DEFAULT 0,
                "averageAccuracy" numeric(5,2) NOT NULL DEFAULT 0,
                "averageChangePercent" numeric(8,4) NOT NULL DEFAULT 0,
                "successRate" numeric(5,2) NOT NULL DEFAULT 0,
                "successfulPredictions" integer NOT NULL DEFAULT 0,
                "lastUpdated" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_prediction_rules" PRIMARY KEY ("id")
            )
        `);

        // Create daily_reports table
        await queryRunner.query(`
            CREATE TABLE "daily_reports" (
                "id" SERIAL NOT NULL,
                "reportDate" date NOT NULL,
                "reportData" jsonb,
                "totalArticles" integer NOT NULL DEFAULT 0,
                "totalPredictions" integer NOT NULL DEFAULT 0,
                "averageAccuracy" numeric(5,2) NOT NULL DEFAULT 0,
                "topGainers" jsonb,
                "topLosers" jsonb,
                "insights" jsonb,
                "recommendations" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_daily_reports" PRIMARY KEY ("id")
            )
        `);

        // Create news_clusters table
        await queryRunner.query(`
            CREATE TABLE "news_clusters" (
                "id" SERIAL NOT NULL,
                "clusterType" character varying(50) NOT NULL,
                "mainArticleId" integer NOT NULL,
                "articleIds" jsonb NOT NULL,
                "clusterScore" numeric(5,2) NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_news_clusters" PRIMARY KEY ("id")
            )
        `);

        // Create retrospective_analyses table
        await queryRunner.query(`
            CREATE TABLE "retrospective_analyses" (
                "id" SERIAL NOT NULL,
                "stockSymbol" character varying(10) NOT NULL,
                "movementPercent" numeric(8,4) NOT NULL,
                "analysisDate" date NOT NULL,
                "movementStartTime" TIMESTAMP NOT NULL,
                "movementEndTime" TIMESTAMP NOT NULL,
                "precedingNewsCount" integer NOT NULL DEFAULT 0,
                "existingPredictionsCount" integer NOT NULL DEFAULT 0,
                "missedOpportunity" boolean NOT NULL DEFAULT false,
                "missedReasons" jsonb,
                "retrospectiveAccuracy" numeric(5,2) NOT NULL DEFAULT 0,
                "analysisData" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_retrospective_analyses" PRIMARY KEY ("id")
            )
        `);

        // Create pattern_recognitions table
        await queryRunner.query(`
            CREATE TABLE "pattern_recognitions" (
                "id" SERIAL NOT NULL,
                "patternType" character varying(50) NOT NULL,
                "patternData" jsonb,
                "confidence" numeric(5,2) NOT NULL DEFAULT 0,
                "occurrences" integer NOT NULL DEFAULT 0,
                "accuracy" numeric(5,2) NOT NULL DEFAULT 0,
                "lastSeen" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_pattern_recognitions" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for prediction_rules
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_prediction_rules_type_value" ON "prediction_rules" ("ruleType", "ruleValue")`);
        await queryRunner.query(`CREATE INDEX "IDX_prediction_rules_type" ON "prediction_rules" ("ruleType")`);
        await queryRunner.query(`CREATE INDEX "IDX_prediction_rules_accuracy" ON "prediction_rules" ("averageAccuracy")`);

        // Create indexes for daily_reports
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_daily_reports_date" ON "daily_reports" ("reportDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_daily_reports_accuracy" ON "daily_reports" ("averageAccuracy")`);

        // Create indexes for news_clusters
        await queryRunner.query(`CREATE INDEX "IDX_news_clusters_main_article" ON "news_clusters" ("mainArticleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_news_clusters_type" ON "news_clusters" ("clusterType")`);
        await queryRunner.query(`CREATE INDEX "IDX_news_clusters_score" ON "news_clusters" ("clusterScore")`);

        // Create indexes for retrospective_analyses
        await queryRunner.query(`CREATE INDEX "IDX_retrospective_analyses_stock_date" ON "retrospective_analyses" ("stockSymbol", "analysisDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_retrospective_analyses_movement" ON "retrospective_analyses" ("movementPercent")`);
        await queryRunner.query(`CREATE INDEX "IDX_retrospective_analyses_missed" ON "retrospective_analyses" ("missedOpportunity")`);

        // Create indexes for pattern_recognitions
        await queryRunner.query(`CREATE INDEX "IDX_pattern_recognitions_type" ON "pattern_recognitions" ("patternType")`);
        await queryRunner.query(`CREATE INDEX "IDX_pattern_recognitions_confidence" ON "pattern_recognitions" ("confidence")`);
        await queryRunner.query(`CREATE INDEX "IDX_pattern_recognitions_last_seen" ON "pattern_recognitions" ("lastSeen")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_pattern_recognitions_last_seen"`);
        await queryRunner.query(`DROP INDEX "IDX_pattern_recognitions_confidence"`);
        await queryRunner.query(`DROP INDEX "IDX_pattern_recognitions_type"`);
        await queryRunner.query(`DROP INDEX "IDX_retrospective_analyses_missed"`);
        await queryRunner.query(`DROP INDEX "IDX_retrospective_analyses_movement"`);
        await queryRunner.query(`DROP INDEX "IDX_retrospective_analyses_stock_date"`);
        await queryRunner.query(`DROP INDEX "IDX_news_clusters_score"`);
        await queryRunner.query(`DROP INDEX "IDX_news_clusters_type"`);
        await queryRunner.query(`DROP INDEX "IDX_news_clusters_main_article"`);
        await queryRunner.query(`DROP INDEX "IDX_daily_reports_accuracy"`);
        await queryRunner.query(`DROP INDEX "IDX_daily_reports_date"`);
        await queryRunner.query(`DROP INDEX "IDX_prediction_rules_accuracy"`);
        await queryRunner.query(`DROP INDEX "IDX_prediction_rules_type"`);
        await queryRunner.query(`DROP INDEX "IDX_prediction_rules_type_value"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "pattern_recognitions"`);
        await queryRunner.query(`DROP TABLE "retrospective_analyses"`);
        await queryRunner.query(`DROP TABLE "news_clusters"`);
        await queryRunner.query(`DROP TABLE "daily_reports"`);
        await queryRunner.query(`DROP TABLE "prediction_rules"`);
    }

}
