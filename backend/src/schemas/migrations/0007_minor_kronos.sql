ALTER TABLE "messages" ALTER COLUMN "sentAt" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "groupId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_groupId_group_groupId_fk" FOREIGN KEY ("groupId") REFERENCES "group"("groupId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
