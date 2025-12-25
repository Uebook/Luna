# Voucher API Implementation

## ✅ Completed

### Backend API
1. **Created VoucherController** (`adminpanel/luna-api/app/Http/Controllers/Api/VoucherController.php`)
   - `getUserVouchers()` - Fetches all vouchers for a user
   - `collectVoucher()` - Allows user to collect/claim a voucher
   - Automatically determines voucher status (active, expired, pending)
   - Calculates days left for active vouchers
   - Generates titles, descriptions, and icons based on coupon codes

2. **Added API Routes** (`adminpanel/luna-api/routes/api.php`)
   - `POST /api/v1/voucher/list` - Get user vouchers
   - `POST /api/v1/voucher/collect` - Collect a voucher

### Frontend Updates
1. **Updated VoucherScreen.js**
   - Removed hardcoded voucher data
   - Added API integration to fetch vouchers from backend
   - Added voucher collection functionality
   - Added loading states and error handling
   - Maintains all existing UI functionality

2. **Added API Service Methods** (`src/services/api.js`)
   - `getUserVouchers(userId)` - Fetch vouchers
   - `collectVoucher(userId, couponId)` - Collect voucher

## 📋 Database Requirements

The implementation assumes the following database structure:

### Existing Tables:
- `coupons` table (already exists)
  - Fields: `id`, `code`, `type`, `price`, `times`, `start_date`, `end_date`, `status`

### Required Table:
- `user_coupons` table (needs to be created if it doesn't exist)
  ```sql
  CREATE TABLE `user_coupons` (
    `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` bigint(20) UNSIGNED NOT NULL,
    `coupon_id` bigint(20) UNSIGNED NOT NULL,
    `collected` tinyint(1) DEFAULT 0,
    `used` tinyint(1) DEFAULT 0,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_coupon_unique` (`user_id`, `coupon_id`),
    KEY `user_id` (`user_id`),
    KEY `coupon_id` (`coupon_id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  ```

## 🔄 How It Works

1. **Fetching Vouchers:**
   - User opens VoucherScreen
   - App loads user ID from AsyncStorage
   - Calls `/api/v1/voucher/list` with user_id
   - Backend joins `coupons` with `user_coupons` to determine:
     - If voucher is collected
     - Voucher status (active/expired/pending)
     - Days left
   - Frontend displays vouchers filtered by status (active/expired)

2. **Collecting Vouchers:**
   - User taps "Collect" button on a voucher
   - App calls `/api/v1/voucher/collect` with user_id and coupon_id
   - Backend inserts/updates `user_coupons` table
   - Frontend updates local state to show voucher as collected

## 🎨 UI Features Maintained

- All existing UI components and styling preserved
- Tab filtering (Active/Expired/Progress)
- Voucher card design with notches
- Icon mapping based on voucher code
- Highlight status for collected vouchers
- Days left calculation
- Expiry date formatting

## 📝 Notes

- Voucher titles and icons are auto-generated based on coupon codes
- Status is determined by comparing current date with start_date and end_date
- The `highlight` property is set based on `collected` status
- Vouchers are automatically sorted by status

## ⚠️ Important

If the `user_coupons` table doesn't exist, you'll need to create it using the SQL above, or create a Laravel migration.



