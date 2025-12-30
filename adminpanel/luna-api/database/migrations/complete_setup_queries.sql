-- =====================================================
-- Complete Database Setup for Luna Ecom
-- Includes: Chatbot, Translations, and Live Streaming
-- =====================================================

-- =====================================================
-- 1. PRODUCT CHATBOT TABLES
-- =====================================================

-- Table: product_chatbot_queries
-- Stores user queries about products
CREATE TABLE IF NOT EXISTS `product_chatbot_queries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NULL,
  `is_auto_answer` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'answered', 'closed') NOT NULL DEFAULT 'pending',
  `language` VARCHAR(10) NOT NULL DEFAULT 'en',
  `answered_by` BIGINT UNSIGNED NULL,
  `answered_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `product_chatbot_queries_product_id_status_index` (`product_id`, `status`),
  KEY `product_chatbot_queries_user_id_product_id_index` (`user_id`, `product_id`),
  CONSTRAINT `product_chatbot_queries_user_id_foreign` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `product_chatbot_queries_product_id_foreign` 
    FOREIGN KEY (`product_id`) 
    REFERENCES `products` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: product_faqs
-- Stores frequently asked questions for products
CREATE TABLE IF NOT EXISTS `product_faqs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NULL,
  `question` VARCHAR(255) NOT NULL,
  `answer` TEXT NOT NULL,
  `language` VARCHAR(10) NOT NULL DEFAULT 'en',
  `priority` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `product_faqs_product_id_language_is_active_index` (`product_id`, `language`, `is_active`),
  CONSTRAINT `product_faqs_product_id_foreign` 
    FOREIGN KEY (`product_id`) 
    REFERENCES `products` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: translations
-- Caches translations for performance
CREATE TABLE IF NOT EXISTS `translations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_text` TEXT NOT NULL,
  `target_language` VARCHAR(10) NOT NULL,
  `translated_text` TEXT NOT NULL,
  `usage_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `translations_source_text_target_language_unique` (`source_text`(255), `target_language`),
  KEY `translations_target_language_index` (`target_language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. AGORA LIVE STREAMING TABLES
-- =====================================================

-- Table: live_streams
-- Stores information about live streams
CREATE TABLE IF NOT EXISTS `live_streams` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `channel_name` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('live', 'ended', 'scheduled') NOT NULL DEFAULT 'live',
  `viewer_count` INT NOT NULL DEFAULT 0,
  `likes_count` INT NOT NULL DEFAULT 0,
  `started_at` TIMESTAMP NULL,
  `ended_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `live_streams_channel_name_unique` (`channel_name`),
  KEY `live_streams_user_id_index` (`user_id`),
  KEY `live_streams_status_index` (`status`),
  KEY `live_streams_channel_name_index` (`channel_name`),
  CONSTRAINT `live_streams_user_id_foreign` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: stream_products
-- Links products to live streams
CREATE TABLE IF NOT EXISTS `stream_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stream_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `added_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stream_products_stream_id_product_id_unique` (`stream_id`, `product_id`),
  KEY `stream_products_stream_id_index` (`stream_id`),
  KEY `stream_products_product_id_index` (`product_id`),
  CONSTRAINT `stream_products_stream_id_foreign` 
    FOREIGN KEY (`stream_id`) 
    REFERENCES `live_streams` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `stream_products_product_id_foreign` 
    FOREIGN KEY (`product_id`) 
    REFERENCES `products` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
-- SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
-- FROM information_schema.TABLES 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME IN (
--   'product_chatbot_queries',
--   'product_faqs',
--   'translations',
--   'live_streams',
--   'stream_products'
-- )
-- ORDER BY TABLE_NAME;

-- =====================================================
-- ROLLBACK QUERIES (if needed)
-- =====================================================

-- DROP TABLE IF EXISTS `stream_products`;
-- DROP TABLE IF EXISTS `live_streams`;
-- DROP TABLE IF EXISTS `translations`;
-- DROP TABLE IF EXISTS `product_faqs`;
-- DROP TABLE IF EXISTS `product_chatbot_queries`;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Make sure `users` and `products` tables exist before running
-- 2. All foreign keys use CASCADE delete
-- 3. Indexes are created for performance
-- 4. Use utf8mb4 charset for emoji support
-- 5. Run these queries in order (chatbot tables first, then streaming)



