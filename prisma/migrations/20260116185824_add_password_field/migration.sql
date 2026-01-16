/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '$2a$10$placeholder',
ALTER COLUMN "class" DROP NOT NULL;

-- Update existing users with a default hashed password (password123)
UPDATE "User" SET "password" = '$2a$10$8KVxqCMDr0qTcRXxqYt1/.6YkqfSdL9v3W5SgJnYPR1T0kJyYwP0e' WHERE "password" = '$2a$10$placeholder';

-- Remove the default constraint
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
