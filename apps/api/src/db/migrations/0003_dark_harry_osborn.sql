CREATE TABLE "finding_photos" (
	"finding_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	CONSTRAINT "finding_photos_finding_id_photo_id_pk" PRIMARY KEY("finding_id","photo_id")
);
--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"move_id" uuid NOT NULL,
	"room" text NOT NULL,
	"room_check_id" uuid,
	"source" text NOT NULL,
	"ai_status" text,
	"ai_summary" text,
	"confidence" text,
	"resolution" text NOT NULL,
	"user_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "finding_photos" ADD CONSTRAINT "finding_photos_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finding_photos" ADD CONSTRAINT "finding_photos_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_room_check_id_room_checks_id_fk" FOREIGN KEY ("room_check_id") REFERENCES "public"."room_checks"("id") ON DELETE set null ON UPDATE no action;