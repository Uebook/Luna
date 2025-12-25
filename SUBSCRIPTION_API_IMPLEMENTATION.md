# Subscription/Membership API Implementation

## ✅ Completed

### Backend API
1. **Created SubscriptionController** (`adminpanel/luna-api/app/Http/Controllers/Api/SubscriptionController.php`)
   - `getTiersAndPlans()` - Fetches all membership tiers and subscription plans
   - `getUserStats()` - Gets user's membership statistics (spend, purchases, referrals, current tier)
   - `subscribe()` - Allows user to subscribe to a membership tier with a plan

2. **Added API Routes** (`adminpanel/luna-api/routes/api.php`)
   - `POST /api/v1/subscription/tiers-plans` - Get tiers and plans
   - `POST /api/v1/subscription/user-stats` - Get user membership stats
   - `POST /api/v1/subscription/subscribe` - Subscribe to membership

### Frontend Updates
1. **Updated SubscriptionScreen.js**
   - Removed hardcoded TIERS and PLANS arrays
   - Removed hardcoded USER_YTD stats
   - Added API integration to fetch tiers, plans, and user stats from backend
   - Added subscription functionality with real API calls
   - Maintains all existing UI functionality

2. **Added API Service Methods** (`src/services/api.js`)
   - `getTiersAndPlans()` - Fetch tiers and plans
   - `getUserStats(userId)` - Fetch user stats
   - `subscribe(userId, tierId, planId)` - Subscribe to membership

## 📋 Database Requirements

The implementation requires the following database tables:

### 1. `membership_tiers` table
```sql
CREATE TABLE `membership_tiers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name_key` varchar(255) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `spend_min` decimal(10,2) DEFAULT 0,
  `spend_max` decimal(10,2) DEFAULT NULL,
  `purchases_min` int(11) DEFAULT 0,
  `purchases_max` int(11) DEFAULT NULL,
  `referrals_min` int(11) DEFAULT 0,
  `benefits_keys` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. `membership_plans` table
```sql
CREATE TABLE `membership_plans` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `label_key` varchar(255) DEFAULT NULL,
  `price_kwd` decimal(10,2) NOT NULL,
  `note_key` varchar(255) DEFAULT NULL,
  `duration_months` int(11) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3. `user_memberships` table
```sql
CREATE TABLE `user_memberships` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `tier_id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `started_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `tier_id` (`tier_id`),
  KEY `plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4. `referrals` table (if not exists)
```sql
CREATE TABLE `referrals` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `referrer_id` bigint(20) UNSIGNED NOT NULL,
  `referred_id` bigint(20) UNSIGNED DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `referrer_id` (`referrer_id`),
  KEY `referred_id` (`referred_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 📝 Sample Data

### Insert Sample Tiers:
```sql
INSERT INTO `membership_tiers` (`code`, `name_key`, `color`, `spend_min`, `spend_max`, `purchases_min`, `purchases_max`, `referrals_min`, `benefits_keys`, `sort_order`, `status`) VALUES
('bronze', 'tiers.bronze.name', '#CD7F32', 0, 199, 1, 2, 0, '["tiers.bronze.b1","tiers.bronze.b2","tiers.bronze.b3"]', 1, 1),
('silver', 'tiers.silver.name', '#C0C0C0', 200, 499, 3, 5, 2, '["tiers.silver.b1","tiers.silver.b2","tiers.silver.b3","tiers.silver.b4","tiers.silver.b5"]', 2, 1),
('gold', 'tiers.gold.name', '#FFD700', 500, 999, 6, 10, 3, '["tiers.gold.b1","tiers.gold.b2","tiers.gold.b3","tiers.gold.b4","tiers.gold.b5"]', 3, 1),
('platinum', 'tiers.platinum.name', '#E5E4E2', 1000, NULL, 11, NULL, 5, '["tiers.platinum.b1","tiers.platinum.b2","tiers.platinum.b3","tiers.platinum.b4","tiers.platinum.b5"]', 4, 1);
```

### Insert Sample Plans:
```sql
INSERT INTO `membership_plans` (`code`, `label_key`, `price_kwd`, `note_key`, `duration_months`, `sort_order`, `status`) VALUES
('monthly', 'plans.monthly', 1.9, 'plans.monthlyNote', 1, 1, 1),
('yearly', 'plans.yearly', 19.0, 'plans.yearlyNote', 12, 2, 1);
```

## 🔄 How It Works

1. **Fetching Tiers and Plans:**
   - App loads SubscriptionScreen
   - Calls `/api/v1/subscription/tiers-plans`
   - Backend returns all active tiers and plans
   - Frontend displays tiers with their requirements and benefits

2. **Fetching User Stats:**
   - App loads user ID from AsyncStorage
   - Calls `/api/v1/subscription/user-stats` with user_id
   - Backend calculates:
     - Total spend from orders (year-to-date)
     - Total purchases (year-to-date)
     - Total referrals (year-to-date)
     - Current tier (from active membership or calculated based on requirements)
   - Frontend displays stats in status card

3. **Subscribing:**
   - User selects a tier and plan
   - Taps "Subscribe" button
   - App calls `/api/v1/subscription/subscribe` with user_id, tier_id, plan_id
   - Backend:
     - Deactivates existing membership
     - Creates new membership with expiry date based on plan duration
   - Frontend refreshes user stats to show updated tier

## 🎨 UI Features Maintained

- All existing UI components and styling preserved
- Tier cards with requirements and benefits
- Plan selection (monthly/yearly)
- Current tier badge
- User stats display (spend, purchases)
- Subscription confirmation modal
- All translation keys preserved

## 📝 Notes

- Tier colors are returned from API but fallback to defaults if not provided
- Benefits are stored as JSON array of translation keys
- Infinity values are stored as NULL in database and converted in frontend
- Current tier is determined by active membership or auto-calculated based on requirements
- User stats are calculated from orders table for current year

## ⚠️ Important

1. Make sure all tables are created before using the API
2. Insert sample data (tiers and plans) as shown above
3. The `referrals` table is optional - if it doesn't exist, referrals will be 0
4. Ensure the `orders` table has `user_id`, `payment_status`, `pay_amount`, and `created_at` fields



