-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('ADMIN', 'STUDENT', 'TEACHER') NOT NULL DEFAULT 'STUDENT';
