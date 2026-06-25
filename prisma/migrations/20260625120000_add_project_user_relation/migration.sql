-- Existing projects have no owner; clear them before enforcing user scoping.
DELETE FROM "Project";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
