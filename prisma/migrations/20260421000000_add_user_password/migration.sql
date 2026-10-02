-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';

-- Remove the default so future inserts must provide the value explicitly
ALTER TABLE "users" ALTER COLUMN "passwordHash" DROP DEFAULT;
