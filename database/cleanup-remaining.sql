-- ============================================================================
-- CLEANUP REMAINING OBJECTS
-- ============================================================================
-- Drop the remaining payments table and enum from old project
-- ============================================================================

DROP TABLE IF EXISTS "payments" CASCADE;
DROP TYPE IF EXISTS "public"."payments_status_enum" CASCADE;

-- Verify cleanup
SELECT 
    schemaname,
    tablename
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename;

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

