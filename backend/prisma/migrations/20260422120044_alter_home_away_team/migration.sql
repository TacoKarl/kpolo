/*
  Warnings:

  - You are about to drop the column `team1_id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team1_score` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2_id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2_score` on the `Match` table. All the data in the column will be lost.
  - Added the required column `away_team_id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `home_team_id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_team1_id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_team2_id_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "team1_id",
DROP COLUMN "team1_score",
DROP COLUMN "team2_id",
DROP COLUMN "team2_score",
ADD COLUMN     "away_team_id" INTEGER NOT NULL,
ADD COLUMN     "away_team_score" INTEGER,
ADD COLUMN     "home_team_id" INTEGER NOT NULL,
ADD COLUMN     "home_team_score" INTEGER;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
