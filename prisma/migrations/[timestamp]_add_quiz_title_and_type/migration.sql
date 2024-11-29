-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT 'Untitled Quiz',
                      ADD COLUMN `type` ENUM('REGULAR', 'ASSIGNED') NOT NULL DEFAULT 'REGULAR';

-- AlterTable
ALTER TABLE `quiz_assignments` ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false; 
