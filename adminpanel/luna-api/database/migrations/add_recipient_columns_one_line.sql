-- One-line SQL command to add recipient columns
ALTER TABLE `gift_card_purchases` ADD COLUMN `recipient_user_id` BIGINT UNSIGNED NULL AFTER `user_id`, ADD INDEX `idx_recipient_user_id` (`recipient_user_id`), ADD FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL, ADD COLUMN `recipient_phone` VARCHAR(20) NULL AFTER `recipient_email`;

