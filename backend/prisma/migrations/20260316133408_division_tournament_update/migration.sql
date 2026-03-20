/*
  Warnings:

  - A unique constraint covering the columns `[club_id,name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_id,user_id,from_date]` on the table `TeamMembership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "division_id" INTEGER;

-- CreateTable
CREATE TABLE "Division" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "division_id" INTEGER NOT NULL,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentDate" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Division_tournament_id_name_key" ON "Division"("tournament_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_tournament_id_team_id_key" ON "TournamentTeam"("tournament_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_team_id_division_id_key" ON "TournamentTeam"("team_id", "division_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_club_id_name_key" ON "Team"("club_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_team_id_user_id_from_date_key" ON "TeamMembership"("team_id", "user_id", "from_date");

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentDate" ADD CONSTRAINT "TournamentDate_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
