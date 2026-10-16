CREATE TABLE "guidance_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"move_id" uuid NOT NULL,
	"item_key" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guidance_progress_move_id_item_key_unique" UNIQUE("move_id","item_key")
);
--> statement-breakpoint
CREATE TABLE "moves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" text NOT NULL,
	"move_date" date,
	"phase" text DEFAULT 'prepare' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guidance_progress" ADD CONSTRAINT "guidance_progress_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;