ALTER TABLE "guidance_progress" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
UPDATE "guidance_progress" SET "status" = 'done' WHERE "completed";--> statement-breakpoint
ALTER TABLE "guidance_progress" DROP COLUMN "completed";
