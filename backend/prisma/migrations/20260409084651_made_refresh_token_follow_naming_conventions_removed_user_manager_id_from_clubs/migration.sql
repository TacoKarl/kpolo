/*
  Warnings:

  - You are about to drop the column `user_manager_id` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the `RefreshTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Club" DROP CONSTRAINT "Club_user_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "RefreshTokens" DROP CONSTRAINT "RefreshTokens_user_id_fkey";

-- DropIndex
DROP INDEX "Club_user_manager_id_key";

-- AlterTable
ALTER TABLE "Club" DROP COLUMN "user_manager_id",
ADD COLUMN     "contact_email" TEXT;

-- DropTable
DROP TABLE "RefreshTokens";

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_hash_key" ON "RefreshToken"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_user_id_device_id_key" ON "RefreshToken"("user_id", "device_id");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
