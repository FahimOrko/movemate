CREATE TABLE "provider_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"move_id" uuid NOT NULL,
	"category" text NOT NULL,
	"provider_key" text NOT NULL,
	CONSTRAINT "provider_selections_move_id_category_unique" UNIQUE("move_id","category")
);
--> statement-breakpoint
ALTER TABLE "provider_selections" ADD CONSTRAINT "provider_selections_move_id_moves_id_fk" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE cascade ON UPDATE no action;