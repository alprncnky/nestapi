import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeedTable1762106568000 implements MigrationInterface {
    name = 'CreateFeedTable1762106568000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create feeds table
        await queryRunner.query(`
            CREATE TABLE "feeds" (
                "id" SERIAL NOT NULL,
                "url" character varying(1000) NOT NULL,
                "title" character varying(500) NOT NULL,
                "text" text,
                "source" character varying(255) NOT NULL,
                "feedType" integer NOT NULL,
                "fetchedAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_feeds_id" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for better query performance
        await queryRunner.query(`CREATE INDEX "idx_feed_url" ON "feeds" ("url")`);
        await queryRunner.query(`CREATE INDEX "idx_feed_source" ON "feeds" ("source")`);
        await queryRunner.query(`CREATE INDEX "idx_feed_type" ON "feeds" ("feedType")`);
        await queryRunner.query(`CREATE INDEX "idx_feed_fetched_at" ON "feeds" ("fetchedAt")`);
        await queryRunner.query(`CREATE INDEX "idx_feed_created_at" ON "feeds" ("createdAt")`);

        // Add comment for feedType column
        await queryRunner.query(`
            COMMENT ON COLUMN "feeds"."feedType" IS '1=News, 2=Internet, 3=Forum, 4=Twitter'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."idx_feed_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_feed_fetched_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_feed_type"`);
        await queryRunner.query(`DROP INDEX "public"."idx_feed_source"`);
        await queryRunner.query(`DROP INDEX "public"."idx_feed_url"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "feeds"`);
    }
}

