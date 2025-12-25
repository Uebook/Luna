-- Single-line SQL commands for Celebrity Login Setup

-- Option 1: Update existing user to be a celebrity (by email)
UPDATE `users` SET `is_provider` = 1, `status` = 1 WHERE `email` = 'celebrity@example.com';

-- Option 2: Update existing user to be a celebrity (by ID)
UPDATE `users` SET `is_provider` = 1, `status` = 1 WHERE `id` = 1;

-- Option 3: Create new celebrity user (password will need to be hashed via Laravel - use admin panel or tinker)
-- Note: Replace the password hash with one generated from Laravel: Hash::make('your_password')
INSERT INTO `users` (`name`, `email`, `email_verified`, `password`, `is_provider`, `status`, `created_at`, `updated_at`) VALUES ('Celebrity User', 'celebrity@example.com', 1, '$2y$10$YourHashedPasswordHere', 1, 1, NOW(), NOW());



