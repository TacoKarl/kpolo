-- CreateTable
CREATE TABLE "Fine" (
    "id" SERIAL NOT NULL,
    "club_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paid" BOOLEAN NOT NULL,

    CONSTRAINT "Fine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
