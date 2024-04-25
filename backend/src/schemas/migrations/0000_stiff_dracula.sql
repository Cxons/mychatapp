CREATE TABLE IF NOT EXISTS "user" (
	"userId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"verificationCode" varchar(255),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"conversationId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creatorId" uuid NOT NULL,
	"recipientId" uuid NOT NULL,
	"createdAt" time
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"messagesId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"senderId" uuid NOT NULL,
	"receiverId" uuid NOT NULL,
	"chatId" uuid NOT NULL,
	"message" varchar(10000),
	"sentAt" time
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_creatorId_user_userId_fk" FOREIGN KEY ("creatorId") REFERENCES "user"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_recipientId_user_userId_fk" FOREIGN KEY ("recipientId") REFERENCES "user"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_user_userId_fk" FOREIGN KEY ("senderId") REFERENCES "user"("userId") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_user_userId_fk" FOREIGN KEY ("receiverId") REFERENCES "user"("userId") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_conversations_conversationId_fk" FOREIGN KEY ("chatId") REFERENCES "conversations"("conversationId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
