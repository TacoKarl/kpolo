/*
  Warnings:

  - You are about to drop the column `city` on the `Club` table. All the data in the column will be lost.
  - Added the required column `region` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Club" DROP COLUMN "city",
ADD COLUMN     "region" TEXT NOT NULL;
