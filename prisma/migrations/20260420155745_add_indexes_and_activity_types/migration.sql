-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'USER_ROLE_CHANGED';
ALTER TYPE "ActivityType" ADD VALUE 'USER_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'INVITE_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'INVITE_REVOKED';

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "activities"("userId");

-- CreateIndex
CREATE INDEX "activities_shotId_idx" ON "activities"("shotId");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE INDEX "activities_type_idx" ON "activities"("type");

-- CreateIndex
CREATE INDEX "check_items_shotId_idx" ON "check_items"("shotId");

-- CreateIndex
CREATE INDEX "check_items_chapterId_idx" ON "check_items"("chapterId");

-- CreateIndex
CREATE INDEX "check_items_ownerId_idx" ON "check_items"("ownerId");

-- CreateIndex
CREATE INDEX "check_items_shotId_state_idx" ON "check_items"("shotId", "state");

-- CreateIndex
CREATE INDEX "comments_shotId_idx" ON "comments"("shotId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "comments_parentId_idx" ON "comments"("parentId");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "render_versions_shotId_idx" ON "render_versions"("shotId");

-- CreateIndex
CREATE INDEX "shots_projectId_idx" ON "shots"("projectId");

-- CreateIndex
CREATE INDEX "shots_assigneeId_idx" ON "shots"("assigneeId");

-- CreateIndex
CREATE INDEX "shots_status_idx" ON "shots"("status");

-- CreateIndex
CREATE INDEX "shots_projectId_status_idx" ON "shots"("projectId", "status");
