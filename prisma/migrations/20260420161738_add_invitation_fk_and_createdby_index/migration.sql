-- AlterTable
ALTER TABLE "invitations" ALTER COLUMN "createdBy" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "invitations_createdBy_idx" ON "invitations"("createdBy");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
