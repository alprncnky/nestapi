import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobExecutionHistoryTable1761729718229 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for execution status
        await queryRunner.query(`
            CREATE TYPE "public"."job_execution_history_status_enum" AS ENUM('SUCCESS', 'FAILED', 'SKIPPED')
        `);

        // Create job_execution_history table
        await queryRunner.query(`
            CREATE TABLE "job_execution_history" (
                "id" SERIAL NOT NULL,
                "jobName" character varying(255) NOT NULL,
                "status" "public"."job_execution_history_status_enum" NOT NULL,
                "startTime" TIMESTAMP NOT NULL,
                "endTime" TIMESTAMP,
                "duration" integer,
                "errorMessage" text,
                "errorStack" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_job_execution_history" PRIMARY KEY ("id")
            )
        `);

        // Add comment for duration column
        await queryRunner.query(`
            COMMENT ON COLUMN "job_execution_history"."duration" IS 'Duration in milliseconds'
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_job_execution_history_job_name" ON "job_execution_history" ("jobName")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_job_execution_history_start_time" ON "job_execution_history" ("startTime")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_job_execution_history_status" ON "job_execution_history" ("status")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_job_execution_history_status"`);
        await queryRunner.query(`DROP INDEX "IDX_job_execution_history_start_time"`);
        await queryRunner.query(`DROP INDEX "IDX_job_execution_history_job_name"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "job_execution_history"`);
        
        // Drop enum type
        await queryRunner.query(`DROP TYPE "public"."job_execution_history_status_enum"`);
    }

}

