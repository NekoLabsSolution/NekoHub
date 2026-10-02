-- AlterTable: make business fields optional (Stripe Express collects them during onboarding)
ALTER TABLE "producers" ALTER COLUMN "businessName" DROP NOT NULL;
ALTER TABLE "producers" ALTER COLUMN "documentType" DROP NOT NULL;
ALTER TABLE "producers" ALTER COLUMN "documentNumber" DROP NOT NULL;

-- AlterTable: track Stripe Connect account capabilities
ALTER TABLE "producers" ADD COLUMN "chargesEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "producers" ADD COLUMN "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false;
