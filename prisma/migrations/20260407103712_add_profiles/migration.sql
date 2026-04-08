-- CreateTable
CREATE TABLE "profiles" (
    "account_id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_account_id_key" ON "profiles"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
