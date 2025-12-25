-- Manual SQL to add contact preferences columns to users table
-- All preferences default to 1 (enabled)

ALTER TABLE `users` 
ADD COLUMN `notif_new_msg` TINYINT(1) NOT NULL DEFAULT 1 AFTER `language`,
ADD COLUMN `email_promo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `notif_new_msg`,
ADD COLUMN `sms_promo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `email_promo`,
ADD COLUMN `wa_promo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `sms_promo`,
ADD COLUMN `promo_email` VARCHAR(255) NULL AFTER `wa_promo`,
ADD COLUMN `sms_phone` VARCHAR(20) NULL AFTER `promo_email`,
ADD COLUMN `wa_phone` VARCHAR(20) NULL AFTER `sms_phone`;

