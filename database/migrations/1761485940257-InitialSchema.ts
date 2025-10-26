import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1761485940257 implements MigrationInterface {
    name = 'InitialSchema1761485940257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rss_sources_feedtype_enum" AS ENUM('RSS2', 'ATOM', 'JSON')`);
        await queryRunner.query(`CREATE TYPE "public"."rss_sources_category_enum" AS ENUM('COMPANY_NEWS', 'ECONOMY', 'SECTOR_NEWS', 'INTERNATIONAL', 'POLICY', 'FINANCIAL_MARKETS')`);
        await queryRunner.query(`CREATE TABLE "rss_sources" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "url" character varying NOT NULL, "feedType" "public"."rss_sources_feedtype_enum" NOT NULL DEFAULT 'RSS2', "category" "public"."rss_sources_category_enum" NOT NULL, "country" character varying(10) NOT NULL DEFAULT 'TR', "reliabilityScore" numeric(5,2) NOT NULL DEFAULT '50', "isActive" boolean NOT NULL DEFAULT true, "fetchInterval" integer NOT NULL DEFAULT '30', "lastFetchedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6c322599045e57174b34c395b4b" UNIQUE ("url"), CONSTRAINT "PK_1d62d714d6fd7d0241d1f6d260a" PRIMARY KEY ("id")); COMMENT ON COLUMN "rss_sources"."fetchInterval" IS 'Fetch interval in minutes'`);
        await queryRunner.query(`CREATE TABLE "source_reliability_scores" ("id" SERIAL NOT NULL, "sourceId" integer NOT NULL, "evaluationPeriod" character varying(20) NOT NULL, "totalPredictions" integer NOT NULL DEFAULT '0', "correctPredictions" integer NOT NULL DEFAULT '0', "accuracyRate" numeric(5,2) NOT NULL DEFAULT '0', "averageConfidence" numeric(5,2) NOT NULL DEFAULT '0', "companyNewsAccuracy" numeric(5,2), "macroNewsAccuracy" numeric(5,2), "calculatedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c842014d6df39c910bba95b4289" PRIMARY KEY ("id")); COMMENT ON COLUMN "source_reliability_scores"."evaluationPeriod" IS 'e.g., 2025-10, 2025-Q4'`);
        await queryRunner.query(`CREATE TYPE "public"."news_articles_maincategory_enum" AS ENUM('COMPANY_NEWS', 'MACRO_ECONOMY', 'SECTOR_NEWS', 'INTERNATIONAL', 'POLICY_REGULATION', 'FINANCIAL_MARKETS')`);
        await queryRunner.query(`CREATE TYPE "public"."news_articles_impactlevel_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`);
        await queryRunner.query(`CREATE TYPE "public"."news_articles_status_enum" AS ENUM('PENDING', 'PROCESSING', 'PROCESSED', 'ARCHIVED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "news_articles" ("id" SERIAL NOT NULL, "sourceId" integer NOT NULL, "title" character varying(500) NOT NULL, "url" character varying NOT NULL, "guid" character varying(255) NOT NULL, "summary" text, "content" text, "contentPlain" text, "publishedAt" TIMESTAMP NOT NULL, "scrapedAt" TIMESTAMP NOT NULL DEFAULT now(), "imageUrl" text, "imageType" character varying(100), "mainCategory" "public"."news_articles_maincategory_enum", "subCategory" character varying(100), "sentimentScore" numeric(3,2), "relevanceScore" numeric(5,2), "impactLevel" "public"."news_articles_impactlevel_enum", "status" "public"."news_articles_status_enum" NOT NULL DEFAULT 'PENDING', "isDuplicate" boolean NOT NULL DEFAULT false, "masterArticleId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_aec247fc55e65e3a198c7d743a7" UNIQUE ("url"), CONSTRAINT "UQ_ba6733b3b94f9876285ffc68580" UNIQUE ("guid"), CONSTRAINT "PK_ca1b67b1b6b2c382317bbd769dc" PRIMARY KEY ("id")); COMMENT ON COLUMN "news_articles"."sentimentScore" IS '-1 to +1'; COMMENT ON COLUMN "news_articles"."relevanceScore" IS '0 to 100'; COMMENT ON COLUMN "news_articles"."masterArticleId" IS 'Reference to master article if duplicate'`);
        await queryRunner.query(`CREATE INDEX "IDX_aec247fc55e65e3a198c7d743a" ON "news_articles" ("url") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba6733b3b94f9876285ffc6858" ON "news_articles" ("guid") `);
        await queryRunner.query(`CREATE INDEX "IDX_1e5462922756c41449fbb4d8b5" ON "news_articles" ("publishedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_851befa3ad44e15ff0d0bddb11" ON "news_articles" ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."news_tags_tagtype_enum" AS ENUM('COMPANY', 'SECTOR', 'KEYWORD', 'LOCATION', 'INSTITUTION', 'PERSON')`);
        await queryRunner.query(`CREATE TABLE "news_tags" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "tagType" "public"."news_tags_tagtype_enum" NOT NULL, "description" text, "usageCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_61275b74aee2213669b370ae9d8" UNIQUE ("name"), CONSTRAINT "PK_c776d0850982119595098940a88" PRIMARY KEY ("id")); COMMENT ON COLUMN "news_tags"."usageCount" IS 'Number of times this tag has been used'`);
        await queryRunner.query(`CREATE INDEX "IDX_61275b74aee2213669b370ae9d" ON "news_tags" ("name") `);
        await queryRunner.query(`CREATE TYPE "public"."news_article_tags_detectionmethod_enum" AS ENUM('AUTO', 'MANUAL', 'AI', 'REGEX')`);
        await queryRunner.query(`CREATE TABLE "news_article_tags" ("id" SERIAL NOT NULL, "articleId" integer NOT NULL, "tagId" integer NOT NULL, "confidence" numeric(3,2) NOT NULL DEFAULT '1', "detectionMethod" "public"."news_article_tags_detectionmethod_enum" NOT NULL DEFAULT 'AUTO', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_025071632f88f974edc769acdf2" UNIQUE ("articleId", "tagId"), CONSTRAINT "PK_b6c9b76ecf29d6164f72d7a08fd" PRIMARY KEY ("id")); COMMENT ON COLUMN "news_article_tags"."confidence" IS '0 to 1 confidence'`);
        await queryRunner.query(`CREATE TYPE "public"."stock_mentions_sentiment_enum" AS ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL')`);
        await queryRunner.query(`CREATE TABLE "stock_mentions" ("id" SERIAL NOT NULL, "articleId" integer NOT NULL, "stockSymbol" character varying(10) NOT NULL, "stockName" character varying(255), "mentionCount" integer NOT NULL DEFAULT '1', "context" text, "sentiment" "public"."stock_mentions_sentiment_enum" NOT NULL DEFAULT 'NEUTRAL', "sentimentScore" numeric(3,2), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_343b329a05a966db3bfd52396cd" PRIMARY KEY ("id")); COMMENT ON COLUMN "stock_mentions"."sentimentScore" IS '-1 to +1'`);
        await queryRunner.query(`CREATE INDEX "IDX_fb02cb3756b6932b64e90b6235" ON "stock_mentions" ("stockSymbol") `);
        await queryRunner.query(`CREATE TYPE "public"."extracted_items_entitytype_enum" AS ENUM('PERSON', 'ORGANIZATION', 'LOCATION', 'MONEY', 'PERCENT', 'DATE', 'TIME', 'PRODUCT')`);
        await queryRunner.query(`CREATE TABLE "extracted_items" ("id" SERIAL NOT NULL, "articleId" integer NOT NULL, "entityType" "public"."extracted_items_entitytype_enum" NOT NULL, "entityText" character varying(500) NOT NULL, "normalizedValue" character varying(500), "position" integer, "confidence" numeric(3,2) NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7494ae1cd1146f025a00b4434b5" PRIMARY KEY ("id")); COMMENT ON COLUMN "extracted_items"."position" IS 'Position in text'; COMMENT ON COLUMN "extracted_items"."confidence" IS '0 to 1 confidence'`);
        await queryRunner.query(`CREATE INDEX "IDX_86a8958a0b039ca63875d9fcdd" ON "extracted_items" ("entityType") `);
        await queryRunner.query(`CREATE TYPE "public"."news_reliability_tracking_predictedimpact_enum" AS ENUM('UP', 'DOWN', 'NEUTRAL')`);
        await queryRunner.query(`CREATE TYPE "public"."news_reliability_tracking_actualimpact_enum" AS ENUM('UP', 'DOWN', 'NEUTRAL')`);
        await queryRunner.query(`CREATE TABLE "news_reliability_tracking" ("id" SERIAL NOT NULL, "articleId" integer NOT NULL, "stockSymbol" character varying(10) NOT NULL, "predictedImpact" "public"."news_reliability_tracking_predictedimpact_enum", "predictedChangePercent" numeric(10,4), "predictionConfidence" numeric(5,2), "actualChangePercent" numeric(10,4), "actualImpact" "public"."news_reliability_tracking_actualimpact_enum", "predictionAccuracy" numeric(5,2), "evaluationDate" TIMESTAMP, "timeWindow" character varying(10), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4e24b70095b72a135974f7fba9" PRIMARY KEY ("id")); COMMENT ON COLUMN "news_reliability_tracking"."predictionConfidence" IS '0 to 100'; COMMENT ON COLUMN "news_reliability_tracking"."predictionAccuracy" IS '0 to 100'; COMMENT ON COLUMN "news_reliability_tracking"."timeWindow" IS 'e.g., 1H, 4H, 1D, 1W'`);
        await queryRunner.query(`CREATE INDEX "IDX_9cb565b117b4a624201d25638f" ON "news_reliability_tracking" ("stockSymbol") `);
        await queryRunner.query(`ALTER TABLE "source_reliability_scores" ADD CONSTRAINT "FK_ee93559851d568de4f8dd76b997" FOREIGN KEY ("sourceId") REFERENCES "rss_sources"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "news_articles" ADD CONSTRAINT "FK_5b8ba8122d0dcdb0e57237745b7" FOREIGN KEY ("sourceId") REFERENCES "rss_sources"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "news_article_tags" ADD CONSTRAINT "FK_f0cc3884524cf0ff3087c160eb5" FOREIGN KEY ("articleId") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "news_article_tags" ADD CONSTRAINT "FK_abd07ebc97016f8e38aa779bc7e" FOREIGN KEY ("tagId") REFERENCES "news_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_mentions" ADD CONSTRAINT "FK_a5beab0e6256cccf47f47736b8b" FOREIGN KEY ("articleId") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "extracted_items" ADD CONSTRAINT "FK_2ee65e4f9e391740f8554d099e4" FOREIGN KEY ("articleId") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "news_reliability_tracking" ADD CONSTRAINT "FK_369d76dbdef0883ce27e7426177" FOREIGN KEY ("articleId") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "news_reliability_tracking" DROP CONSTRAINT "FK_369d76dbdef0883ce27e7426177"`);
        await queryRunner.query(`ALTER TABLE "extracted_items" DROP CONSTRAINT "FK_2ee65e4f9e391740f8554d099e4"`);
        await queryRunner.query(`ALTER TABLE "stock_mentions" DROP CONSTRAINT "FK_a5beab0e6256cccf47f47736b8b"`);
        await queryRunner.query(`ALTER TABLE "news_article_tags" DROP CONSTRAINT "FK_abd07ebc97016f8e38aa779bc7e"`);
        await queryRunner.query(`ALTER TABLE "news_article_tags" DROP CONSTRAINT "FK_f0cc3884524cf0ff3087c160eb5"`);
        await queryRunner.query(`ALTER TABLE "news_articles" DROP CONSTRAINT "FK_5b8ba8122d0dcdb0e57237745b7"`);
        await queryRunner.query(`ALTER TABLE "source_reliability_scores" DROP CONSTRAINT "FK_ee93559851d568de4f8dd76b997"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cb565b117b4a624201d25638f"`);
        await queryRunner.query(`DROP TABLE "news_reliability_tracking"`);
        await queryRunner.query(`DROP TYPE "public"."news_reliability_tracking_actualimpact_enum"`);
        await queryRunner.query(`DROP TYPE "public"."news_reliability_tracking_predictedimpact_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86a8958a0b039ca63875d9fcdd"`);
        await queryRunner.query(`DROP TABLE "extracted_items"`);
        await queryRunner.query(`DROP TYPE "public"."extracted_items_entitytype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb02cb3756b6932b64e90b6235"`);
        await queryRunner.query(`DROP TABLE "stock_mentions"`);
        await queryRunner.query(`DROP TYPE "public"."stock_mentions_sentiment_enum"`);
        await queryRunner.query(`DROP TABLE "news_article_tags"`);
        await queryRunner.query(`DROP TYPE "public"."news_article_tags_detectionmethod_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61275b74aee2213669b370ae9d"`);
        await queryRunner.query(`DROP TABLE "news_tags"`);
        await queryRunner.query(`DROP TYPE "public"."news_tags_tagtype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_851befa3ad44e15ff0d0bddb11"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e5462922756c41449fbb4d8b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba6733b3b94f9876285ffc6858"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aec247fc55e65e3a198c7d743a"`);
        await queryRunner.query(`DROP TABLE "news_articles"`);
        await queryRunner.query(`DROP TYPE "public"."news_articles_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."news_articles_impactlevel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."news_articles_maincategory_enum"`);
        await queryRunner.query(`DROP TABLE "source_reliability_scores"`);
        await queryRunner.query(`DROP TABLE "rss_sources"`);
        await queryRunner.query(`DROP TYPE "public"."rss_sources_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."rss_sources_feedtype_enum"`);
    }

}
