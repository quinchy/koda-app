-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL,
    "priority" "Priority" NOT NULL,
    "startDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
