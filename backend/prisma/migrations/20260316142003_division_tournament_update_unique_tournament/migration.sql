/*
  Warnings:

  - A unique constraint covering the columns `[name,season]` on the table `Tournament` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tournament_name_season_key" ON "Tournament"("name", "season");
