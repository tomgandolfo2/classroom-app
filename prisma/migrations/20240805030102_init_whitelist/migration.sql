-- CreateTable
CREATE TABLE "Whitelist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Whitelist_url_key" ON "Whitelist"("url");
