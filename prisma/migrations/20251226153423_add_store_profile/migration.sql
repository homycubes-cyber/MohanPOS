-- CreateTable
CREATE TABLE "StoreProfile" (
    "id" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "gstin" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreProfile_pkey" PRIMARY KEY ("id")
);
