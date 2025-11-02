-- ============================================================================
-- DATABASE CLEANUP SCRIPT
-- ============================================================================
-- This script will drop all existing tables, indexes, enums, and constraints
-- Run this script to completely clean the database before creating new migrations
-- 
-- IMPORTANT: This will delete ALL data in the database!
-- Make sure you have a backup if needed before running this script.
-- ============================================================================

-- Drop tables (CASCADE will handle foreign key constraints automatically)
-- Order matters: drop dependent tables first

-- News-related tables (from old schema)
DROP TABLE IF EXISTS "news_reliability_tracking" CASCADE;
DROP TABLE IF EXISTS "extracted_items" CASCADE;
DROP TABLE IF EXISTS "stock_mentions" CASCADE;
DROP TABLE IF EXISTS "news_article_tags" CASCADE;
DROP TABLE IF EXISTS "news_tags" CASCADE;
DROP TABLE IF EXISTS "news_articles" CASCADE;

-- RSS and reliability tables
DROP TABLE IF EXISTS "source_reliability_scores" CASCADE;
DROP TABLE IF EXISTS "rss_sources" CASCADE;

-- Stock-related tables
DROP TABLE IF EXISTS "stock_prices" CASCADE;
DROP TABLE IF EXISTS "stocks" CASCADE;

-- Stock prediction tables (from old schema)
DROP TABLE IF EXISTS "retrospective_analyses" CASCADE;
DROP TABLE IF EXISTS "pattern_recognitions" CASCADE;
DROP TABLE IF EXISTS "news_clusters" CASCADE;
DROP TABLE IF EXISTS "daily_reports" CASCADE;
DROP TABLE IF EXISTS "prediction_rules" CASCADE;

-- Job execution history
DROP TABLE IF EXISTS "job_execution_history" CASCADE;

-- TypeORM migrations table
DROP TABLE IF EXISTS "migrations" CASCADE;

-- Drop all enum types
DROP TYPE IF EXISTS "public"."rss_sources_feedtype_enum" CASCADE;
DROP TYPE IF EXISTS "public"."rss_sources_category_enum" CASCADE;
DROP TYPE IF EXISTS "public"."news_articles_maincategory_enum" CASCADE;
DROP TYPE IF EXISTS "public"."news_articles_impactlevel_enum" CASCADE;
DROP TYPE IF EXISTS "public"."news_articles_status_enum" CASCADE;
DROP TYPE IF EXISTS "public"."news_tags_tagtype_enum" CASCADE;
DROP TYPE IF EXISTS "public"."news_article_tags_detectionmethod_enum" CASCADE;
DROP TYPE IF EXISTS "public"."stock_mentions_sentiment_enum" CASCADE;
DROP TYPE IF EXISTS "public"."extracted_items_entitytype_enum" CASCADE;
DROP TYPE IF EXISTS "public"."news_reliability_tracking_predictedimpact_enum" CASCADE;
DROP TYPE IF EXISTS "public"."news_reliability_tracking_actualimpact_enum" CASCADE;
DROP TYPE IF EXISTS "public"."job_execution_history_status_enum" CASCADE;

-- Drop any remaining indexes (most will be dropped with tables, but just in case)
DROP INDEX IF EXISTS "idx_symbol_market_type";
DROP INDEX IF EXISTS "idx_market_type";
DROP INDEX IF EXISTS "idx_fetched_at";
DROP INDEX IF EXISTS "IDX_job_execution_history_job_name";
DROP INDEX IF EXISTS "IDX_job_execution_history_start_time";
DROP INDEX IF EXISTS "IDX_job_execution_history_status";
DROP INDEX IF EXISTS "IDX_aec247fc55e65e3a198c7d743a";
DROP INDEX IF EXISTS "IDX_ba6733b3b94f9876285ffc6858";
DROP INDEX IF EXISTS "IDX_1e5462922756c41449fbb4d8b5";
DROP INDEX IF EXISTS "IDX_851befa3ad44e15ff0d0bddb11";
DROP INDEX IF EXISTS "IDX_61275b74aee2213669b370ae9d";
DROP INDEX IF EXISTS "IDX_fb02cb3756b6932b64e90b6235";
DROP INDEX IF EXISTS "IDX_86a8958a0b039ca63875d9fcdd";
DROP INDEX IF EXISTS "IDX_9cb565b117b4a624201d25638f";

-- Show remaining tables (for verification)
SELECT 
    schemaname,
    tablename
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename;

-- Show remaining enums (for verification)
SELECT 
    n.nspname as schema,
    t.typname as type_name
FROM 
    pg_type t
    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE 
    (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid))
    AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
    AND n.nspname = 'public'
ORDER BY 
    schema, type_name;

