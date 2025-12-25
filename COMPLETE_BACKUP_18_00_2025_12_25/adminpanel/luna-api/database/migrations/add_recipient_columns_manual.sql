-- Manual SQL script to add recipient columns to gift_card_purchases table
-- Run this if the migration cannot be executed via artisan

-- Check and add recipient_user_id column
SET @dbname = DATABASE();
SET @tablename = "gift_card_purchases";
SET @columnname = "recipient_user_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column recipient_user_id already exists.';",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " BIGINT UNSIGNED NULL AFTER user_id, ADD INDEX idx_recipient_user_id (recipient_user_id), ADD FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE SET NULL;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add recipient_phone column
SET @columnname = "recipient_phone";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column recipient_phone already exists.';",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(20) NULL AFTER recipient_email;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Simple version (if the above doesn't work, use these directly):
-- ALTER TABLE `gift_card_purchases` 
-- ADD COLUMN `recipient_user_id` BIGINT UNSIGNED NULL AFTER `user_id`,
-- ADD INDEX `idx_recipient_user_id` (`recipient_user_id`),
-- ADD FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- ALTER TABLE `gift_card_purchases` 
-- ADD COLUMN `recipient_phone` VARCHAR(20) NULL AFTER `recipient_email`;

