-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
