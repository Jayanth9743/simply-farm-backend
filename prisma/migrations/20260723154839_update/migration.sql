/*
  Warnings:

  - A unique constraint covering the columns `[tokenHashed]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHashed_key" ON "RefreshToken"("tokenHashed");
