ALTER TABLE "conversations" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "createdAt" SET DEFAULT now();