-- =====================================================
-- Agora Live Streaming Tables
-- Run these SQL queries to create the required tables
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
-- Optional: Insert sample data (for testing)
-- =====================================================

-- Uncomment below to insert sample data

-- INSERT INTO `live_streams` (`user_id`, `channel_name`, `title`, `description`, `status`, `viewer_count`, `likes_count`, `started_at`, `created_at`, `updated_at`) 
-- VALUES 
-- (1, 'stream_sample_001', 'Sample Live Stream', 'This is a sample live stream', 'live', 0, 0, NOW(), NOW(), NOW());

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if tables were created successfully
-- SELECT TABLE_NAME, TABLE_ROWS 
-- FROM information_schema.TABLES 
-- WHERE TABLE_SCHEMA = DATABASE() 
-- AND TABLE_NAME IN ('live_streams', 'stream_products');

-- Check table structure
-- DESCRIBE `live_streams`;
-- DESCRIBE `stream_products`;

-- =====================================================
-- Rollback Queries (if needed)
-- =====================================================

-- DROP TABLE IF EXISTS `stream_products`;
-- DROP TABLE IF EXISTS `live_streams`;



