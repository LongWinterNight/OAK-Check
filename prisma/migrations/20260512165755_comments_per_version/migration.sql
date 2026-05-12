-- Add versionId to comments to scope pins/discussions per render version.
-- Existing comments stay with versionId = NULL (legacy, visible across all versions).
ALTER TABLE "comments" ADD COLUMN "versionId" TEXT;

ALTER TABLE "comments" ADD CONSTRAINT "comments_versionId_fkey"
  FOREIGN KEY ("versionId") REFERENCES "render_versions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "comments_versionId_idx" ON "comments"("versionId");
