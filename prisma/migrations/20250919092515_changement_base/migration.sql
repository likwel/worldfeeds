-- AlterTable
ALTER TABLE "public"."Article" ADD COLUMN     "categories" TEXT,
ADD COLUMN     "creator" TEXT,
ADD COLUMN     "enclosureLength" TEXT,
ADD COLUMN     "enclosureType" TEXT,
ADD COLUMN     "enclosureUrl" TEXT,
ADD COLUMN     "thumbnail" TEXT;
