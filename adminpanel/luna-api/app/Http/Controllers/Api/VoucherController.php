<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VoucherController extends Controller
{
    /**
     * Get user vouchers (coupons assigned to user)
     */
    public function getUserVouchers(Request $request)
    {
        try {
            $userId = $request->user_id;
            
            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'User ID is required'
                ], 400);
            }

            // Get all vouchers (coupons) available to the user
            // This includes both general coupons and user-specific coupons
            $vouchers = DB::table('coupons')
                ->leftJoin('user_coupons', function($join) use ($userId) {
                    $join->on('coupons.id', '=', 'user_coupons.coupon_id')
                         ->where('user_coupons.user_id', '=', $userId);
                })
                ->where('coupons.status', 1)
                ->select(
                    'coupons.id',
                    'coupons.code',
                    'coupons.type',
                    'coupons.price',
                    'coupons.times',
                    'coupons.start_date',
                    'coupons.end_date',
                    DB::raw('COALESCE(user_coupons.used, 0) as used'),
                    DB::raw('COALESCE(user_coupons.collected, 0) as collected')
                )
                ->get();

            $formattedVouchers = $vouchers->map(function ($voucher) {
                $now = Carbon::now();
                $startDate = Carbon::parse($voucher->start_date);
                $endDate = Carbon::parse($voucher->end_date);
                
                // Determine status
                $status = 'active';
                if ($now->isAfter($endDate)) {
                    $status = 'expired';
                } elseif ($now->isBefore($startDate)) {
                    $status = 'pending';
                }

                // Calculate days left
                $daysLeft = null;
                if ($status === 'active') {
                    $daysLeft = $now->diffInDays($endDate);
                }

                // Format expiry date
                $expiry = 'Valid Until ' . $endDate->format('m.d.y');
                
                // Format days left text
                $daysLeftText = $daysLeft !== null ? $daysLeft . ' days left' : null;

                // Generate title and description based on coupon code/type
                $title = $this->generateTitle($voucher->code);
                $description = $this->generateDescription($voucher->type, $voucher->price);
                $icon = $this->getIconForVoucher($voucher->code);
                $highlight = $voucher->collected == 1 ? true : false;

                return [
                    'id' => $voucher->id,
                    'title' => $title,
                    'description' => $description,
                    'expiry' => $expiry,
                    'daysLeft' => $daysLeftText,
                    'icon' => $icon,
                    'highlight' => $highlight,
                    'status' => $status,
                    'code' => $voucher->code,
                    'type' => $voucher->type,
                    'price' => $voucher->price,
                    'start_date' => $voucher->start_date,
                    'end_date' => $voucher->end_date,
                    'used' => $voucher->used,
                    'collected' => $voucher->collected,
                ];
            });

            return response()->json([
                'status' => true,
                'vouchers' => $formattedVouchers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching vouchers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Collect/Claim a voucher
     */
    public function collectVoucher(Request $request)
    {
        try {
            $userId = $request->user_id;
            $couponId = $request->coupon_id;

            if (!$userId || !$couponId) {
                return response()->json([
                    'status' => false,
                    'message' => 'User ID and Coupon ID are required'
                ], 400);
            }

            // Check if coupon exists and is valid
            $coupon = DB::table('coupons')
                ->where('id', $couponId)
                ->where('status', 1)
                ->first();

            if (!$coupon) {
                return response()->json([
                    'status' => false,
                    'message' => 'Coupon not found or inactive'
                ], 404);
            }

            // Check if already collected
            $existing = DB::table('user_coupons')
                ->where('user_id', $userId)
                ->where('coupon_id', $couponId)
                ->first();

            if ($existing && $existing->collected == 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Voucher already collected'
                ], 400);
            }

            // Insert or update user_coupons
            if ($existing) {
                DB::table('user_coupons')
                    ->where('user_id', $userId)
                    ->where('coupon_id', $couponId)
                    ->update([
                        'collected' => 1,
                        'updated_at' => now()
                    ]);
            } else {
                DB::table('user_coupons')->insert([
                    'user_id' => $userId,
                    'coupon_id' => $couponId,
                    'collected' => 1,
                    'used' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Voucher collected successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error collecting voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate title from coupon code
     */
    private function generateTitle($code)
    {
        // You can customize this based on your coupon naming convention
        $titleMap = [
            'FIRST' => 'First Purchase',
            'GIFT' => 'Gift From Customer Care',
            'LOYAL' => 'Loyal Customer',
            'REVIEW' => 'Review Maker',
            'COLLECTOR' => 'T-Shirt Collector',
            'ORDERS' => '10+ Orders',
        ];

        foreach ($titleMap as $key => $title) {
            if (stripos($code, $key) !== false) {
                return $title;
            }
        }

        // Default: format code as title
        return ucwords(str_replace('_', ' ', $code));
    }

    /**
     * Generate description from type and price
     */
    private function generateDescription($type, $price)
    {
        if ($type === 'fixed') {
            return '$' . number_format($price, 2) . ' off your next order';
        } elseif ($type === 'percentage') {
            return $price . '% off for your next order';
        }
        
        return 'Discount on your next purchase';
    }

    /**
     * Get icon name for voucher
     */
    private function getIconForVoucher($code)
    {
        $iconMap = [
            'FIRST' => 'bag-outline',
            'GIFT' => 'gift-outline',
            'LOYAL' => 'heart-outline',
            'REVIEW' => 'star-outline',
            'COLLECTOR' => 'shirt-outline',
            'ORDERS' => 'trophy-outline',
        ];

        foreach ($iconMap as $key => $icon) {
            if (stripos($code, $key) !== false) {
                return $icon;
            }
        }

        return 'gift-outline'; // Default icon
    }
}


