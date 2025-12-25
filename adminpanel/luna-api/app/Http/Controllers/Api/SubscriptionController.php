<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    /**
     * Get membership tiers and plans
     */
    public function getTiersAndPlans(Request $request)
    {
        try {
            // Get all active tiers
            $tiers = DB::table('membership_tiers')
                ->where('status', 1)
                ->orderBy('sort_order', 'asc')
                ->get();

            // Get all active plans
            $plans = DB::table('membership_plans')
                ->where('status', 1)
                ->orderBy('sort_order', 'asc')
                ->get();

            // Format tiers
            $formattedTiers = $tiers->map(function ($tier) {
                return [
                    'id' => $tier->id,
                    'code' => $tier->code,
                    'name_key' => $tier->name_key ?? 'tiers.' . strtolower($tier->code) . '.name',
                    'color' => $tier->color,
                    'requirements' => [
                        'spend_min' => (float) $tier->spend_min,
                        'spend_max' => $tier->spend_max === null ? null : (float) $tier->spend_max,
                        'purchases_min' => (int) $tier->purchases_min,
                        'purchases_max' => $tier->purchases_max === null ? null : (int) $tier->purchases_max,
                        'referrals_min' => (int) $tier->referrals_min,
                    ],
                    'benefits_keys' => json_decode($tier->benefits_keys ?? '[]', true),
                ];
            });

            // Format plans
            $formattedPlans = $plans->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'code' => $plan->code,
                    'label_key' => $plan->label_key ?? 'plans.' . strtolower($plan->code),
                    'price_kwd' => (float) $plan->price_kwd,
                    'note_key' => $plan->note_key,
                    'duration_months' => (int) $plan->duration_months,
                ];
            });

            return response()->json([
                'status' => true,
                'tiers' => $formattedTiers,
                'plans' => $formattedPlans,
                'tier_colors' => [
                    'bronze' => '#CD7F32',
                    'silver' => '#C0C0C0',
                    'gold' => '#FFD700',
                    'platinum' => '#E5E4E2',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching tiers and plans: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user membership stats
     */
    public function getUserStats(Request $request)
    {
        try {
            $userId = $request->user_id;
            
            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'User ID is required'
                ], 400);
            }

            // Get current year stats
            $currentYear = date('Y');
            $yearStart = $currentYear . '-01-01 00:00:00';
            $yearEnd = $currentYear . '-12-31 23:59:59';

            // Calculate total spend (from orders)
            $totalSpend = DB::table('orders')
                ->where('user_id', $userId)
                ->where('payment_status', 'paid')
                ->whereBetween('created_at', [$yearStart, $yearEnd])
                ->sum('pay_amount') ?? 0;

            // Calculate total purchases
            $totalPurchases = DB::table('orders')
                ->where('user_id', $userId)
                ->where('payment_status', 'paid')
                ->whereBetween('created_at', [$yearStart, $yearEnd])
                ->count();

            // Calculate referrals (assuming you have a referrals table)
            $totalReferrals = DB::table('referrals')
                ->where('referrer_id', $userId)
                ->whereBetween('created_at', [$yearStart, $yearEnd])
                ->count();

            // Get user's current tier
            $userMembership = DB::table('user_memberships')
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->first();

            $currentTier = null;
            if ($userMembership) {
                $tier = DB::table('membership_tiers')
                    ->where('id', $userMembership->tier_id)
                    ->first();
                if ($tier) {
                    $currentTier = $tier->code;
                }
            }

            // If no active membership, determine tier based on requirements
            if (!$currentTier) {
                $tiers = DB::table('membership_tiers')
                    ->where('status', 1)
                    ->orderBy('sort_order', 'desc')
                    ->get();

                foreach ($tiers as $tier) {
                    $spendMatch = $totalSpend >= $tier->spend_min && 
                                  ($tier->spend_max === null || $totalSpend <= $tier->spend_max);
                    $purchaseMatch = $totalPurchases >= $tier->purchases_min && 
                                     ($tier->purchases_max === null || $totalPurchases <= $tier->purchases_max);
                    $referralMatch = $totalReferrals >= $tier->referrals_min;

                    if ($spendMatch && $purchaseMatch && $referralMatch) {
                        $currentTier = $tier->code;
                        break;
                    }
                }
            }

            return response()->json([
                'status' => true,
                'stats' => [
                    'spend_kwd' => (float) $totalSpend,
                    'purchases' => (int) $totalPurchases,
                    'referrals' => (int) $totalReferrals,
                    'current_tier' => $currentTier ?? 'bronze',
                    'year' => $currentYear,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching user stats: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subscribe to a membership plan
     */
    public function subscribe(Request $request)
    {
        try {
            $userId = $request->user_id;
            $tierId = $request->tier_id;
            $planId = $request->plan_id;

            if (!$userId || !$tierId || !$planId) {
                return response()->json([
                    'status' => false,
                    'message' => 'User ID, Tier ID, and Plan ID are required'
                ], 400);
            }

            // Validate tier and plan exist
            $tier = DB::table('membership_tiers')->where('id', $tierId)->where('status', 1)->first();
            $plan = DB::table('membership_plans')->where('id', $planId)->where('status', 1)->first();

            if (!$tier || !$plan) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid tier or plan'
                ], 404);
            }

            // Calculate expiry date based on plan duration
            $expiresAt = date('Y-m-d H:i:s', strtotime('+' . $plan->duration_months . ' months'));

            // Deactivate existing membership
            DB::table('user_memberships')
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->update(['status' => 'inactive', 'updated_at' => now()]);

            // Create new membership
            $membershipId = DB::table('user_memberships')->insertGetId([
                'user_id' => $userId,
                'tier_id' => $tierId,
                'plan_id' => $planId,
                'status' => 'active',
                'started_at' => now(),
                'expires_at' => $expiresAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Subscription activated successfully',
                'membership_id' => $membershipId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error subscribing: ' . $e->getMessage()
            ], 500);
        }
    }
}



