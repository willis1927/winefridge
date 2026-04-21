-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "capacity" INTEGER,
    "owner_id" UUID NOT NULL,

    CONSTRAINT "storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stored_wines" (
    "storedID" SERIAL NOT NULL,
    "owner_id" UUID NOT NULL,
    "notes" TEXT,

    CONSTRAINT "stored_wines_pkey" PRIMARY KEY ("storedID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "storage_owner_id_idx" ON "storage"("owner_id");

-- CreateIndex
CREATE INDEX "stored_wines_owner_id_idx" ON "stored_wines"("owner_id");

-- AddForeignKey
ALTER TABLE "storage" ADD CONSTRAINT "storage_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_wines" ADD CONSTRAINT "stored_wines_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
