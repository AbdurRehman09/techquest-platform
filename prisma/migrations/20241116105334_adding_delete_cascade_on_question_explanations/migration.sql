-- DropForeignKey
ALTER TABLE `question_explanations` DROP FOREIGN KEY `question_explanations_questionId_fkey`;

-- AddForeignKey
ALTER TABLE `question_explanations` ADD CONSTRAINT `question_explanations_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
