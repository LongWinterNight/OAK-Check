-- Add username column for login. Nullable so existing users (invited by email)
-- start without one and can set it later in profile settings.
ALTER TABLE "users" ADD COLUMN "username" TEXT;
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
