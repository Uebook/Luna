-- SQL Script for Reward Points System
-- Run this SQL if you prefer manual execution instead of migration

-- 1. Add reward_points column to users table (if it doesn't exist)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `reward_points` INT NOT NULL DEFAULT 0 AFTER `email`;

-- If your MySQL version doesn't support IF NOT EXISTS, use this instead:
-- ALTER TABLE `users` 
-- ADD COLUMN `reward_points` INT NOT NULL DEFAULT 0 AFTER `email`;

-- 2. Create gift_codes table
CREATE TABLE IF NOT EXISTS `gift_codes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `from_user_id` BIGINT UNSIGNED NOT NULL,
  `to_email` VARCHAR(255) NULL,
  `to_phone` VARCHAR(50) NULL,
  `to_user_id` BIGINT UNSIGNED NULL,
  `points` INT NOT NULL,
  `message` TEXT NULL,
  `status` ENUM('pending', 'redeemed', 'expired') NOT NULL DEFAULT 'pending',
  `expires_at` TIMESTAMP NOT NULL,
  `redeemed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gift_codes_code_unique` (`code`),
  KEY `gift_codes_code_index` (`code`),
  KEY `gift_codes_from_user_id_index` (`from_user_id`),
  KEY `gift_codes_to_user_id_index` (`to_user_id`),
  KEY `gift_codes_status_index` (`status`),
  CONSTRAINT `gift_codes_from_user_id_foreign` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `gift_codes_to_user_id_foreign` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create reward_transactions table
CREATE TABLE IF NOT EXISTS `reward_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('purchase', 'gift_sent', 'gift_received', 'redeem_code', 'admin_adjustment') NOT NULL DEFAULT 'purchase',
  `points` INT NOT NULL,
  `order_id` BIGINT UNSIGNED NULL,
  `gift_code_id` BIGINT UNSIGNED NULL,
  `description` TEXT NULL,
  `amount_bhd` DECIMAL(10, 3) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `reward_transactions_user_id_index` (`user_id`),
  KEY `reward_transactions_type_index` (`type`),
  KEY `reward_transactions_order_id_index` (`order_id`),
  KEY `reward_transactions_gift_code_id_index` (`gift_code_id`),
  KEY `reward_transactions_created_at_index` (`created_at`),
  CONSTRAINT `reward_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reward_transactions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reward_transactions_gift_code_id_foreign` FOREIGN KEY (`gift_code_id`) REFERENCES `gift_codes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

