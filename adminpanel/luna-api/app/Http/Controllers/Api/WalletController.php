<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class WalletController extends Controller
{
    /**
     * Get user wallet info (balance/reward points)
     */
    public function getWalletInfo(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = DB::table('users')->where('id', $request->user_id)->first();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Get reward points - use reward_points column, default to 0 if not set
            $rewardPoints = isset($user->reward_points) ? (int)$user->reward_points : 0;
            
            // Convert to BHD (100 points = 1 BHD, so 1 point = 0.01 BHD)
            $bhdValue = $rewardPoints * 0.01;

            // Calculate total purchase amount from all orders (using same logic as activity stats)
            $totalPurchaseAmount = 0;
            $orders = Order::where('user_id', $request->user_id)->get();
            
            foreach ($orders as $order) {
                // Use pay_amount if available, otherwise calculate from cart
                if (isset($order->pay_amount) && $order->pay_amount > 0) {
                    $totalPurchaseAmount += floatval($order->pay_amount);
                } else {
                    // Parse cart to calculate total (same logic as activity stats)
                    $cart = is_string($order->cart) ? json_decode($order->cart, true) : $order->cart;
                    if ($cart) {
                        $items = [];
                        // Format 1: Array format
                        if (is_array($cart) && isset($cart[0]) && !isset($cart['items'])) {
                            $items = $cart;
                        }
                        // Format 2: Object format {items: {...}}
                        elseif (isset($cart['items'])) {
                            $itemsData = $cart['items'];
                            if (is_array($itemsData) && isset($itemsData[0])) {
                                $items = $itemsData;
                            } elseif (is_object($itemsData) || (is_array($itemsData) && !isset($itemsData[0]))) {
                                $items = array_values($itemsData);
                            }
                        }
                        
                        foreach ($items as $item) {
                            $amount = 0;
                            $qty = 1;
                            
                            if (isset($item['item']) && is_array($item['item'])) {
                                $productData = $item['item'];
                                $amount = isset($item['price']) ? floatval($item['price']) : (isset($productData['price']) ? floatval($productData['price']) : 0);
                                $qty = isset($item['qty']) ? intval($item['qty']) : 1;
                            } elseif (isset($item['id']) || isset($item['product_id'])) {
                                $amount = isset($item['price']) ? floatval($item['price']) : 0;
                                $qty = isset($item['qty']) ? intval($item['qty']) : (isset($item['quantity']) ? intval($item['quantity']) : 1);
                            }
                            
                            $totalPurchaseAmount += $amount * $qty;
                        }
                    }
                }
            }

            return response()->json([
                'status' => true,
                'message' => 'Wallet info fetched successfully.',
                'data' => [
                    'points' => $rewardPoints,
                    'balance_bhd' => round($bhdValue, 3),
                    'points_to_bhd_ratio' => 0.01, // 100 points = 1 BHD
                    'total_purchase_amount' => round($totalPurchaseAmount, 3),
                ],
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching wallet info.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user purchase history (completed orders)
     */
    public function getPurchaseHistory(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Get all orders (not just completed/delivered/refunded)
            $orders = Order::where('user_id', $request->user_id)
                ->orderBy('id', 'desc')
                ->get();

            $purchases = [];
            
            foreach ($orders as $order) {
                // Parse cart to get first product title and calculate amount
                $cart = is_string($order->cart) ? json_decode($order->cart, true) : $order->cart;
                $title = 'Order ' . ($order->order_number ?? $order->id);
                $orderAmount = 0;
                
                // Use same cart parsing logic as activity stats API
                if ($cart) {
                    $items = [];
                    // Format 1: Array format [{product_id, name, price, quantity}]
                    if (is_array($cart) && isset($cart[0]) && !isset($cart['items'])) {
                        $items = $cart;
                    }
                    // Format 2: Object format {items: {...}}
                    elseif (isset($cart['items'])) {
                        $itemsData = $cart['items'];
                        // If items is an array
                        if (is_array($itemsData) && isset($itemsData[0])) {
                            $items = $itemsData;
                        }
                        // If items is an object with keys
                        elseif (is_object($itemsData) || (is_array($itemsData) && !isset($itemsData[0]))) {
                            $items = array_values($itemsData);
                        }
                    }
                    
                    if (!empty($items)) {
                        // Get first item for title
                        $firstItem = $items[0];
                        $productData = $firstItem['item'] ?? $firstItem;
                        $title = $productData['name'] ?? $productData['title'] ?? $title;
                        
                        // Calculate total amount from cart items
                        foreach ($items as $item) {
                            $amount = 0;
                            $qty = 1;
                            
                            if (isset($item['item']) && is_array($item['item'])) {
                                // Format: {item: {id, name, price}, qty, price}
                                $productData = $item['item'];
                                $amount = isset($item['price']) ? floatval($item['price']) : (isset($productData['price']) ? floatval($productData['price']) : 0);
                                $qty = isset($item['qty']) ? intval($item['qty']) : 1;
                            } elseif (isset($item['id']) || isset($item['product_id'])) {
                                // Direct product format: {id, product_id, price, qty, quantity}
                                $amount = isset($item['price']) ? floatval($item['price']) : 0;
                                $qty = isset($item['qty']) ? intval($item['qty']) : (isset($item['quantity']) ? intval($item['quantity']) : 1);
                            }
                            
                            $orderAmount += $amount * $qty;
                        }
                    }
                }
                
                // Use pay_amount if cart calculation failed or if pay_amount is available
                if ($orderAmount == 0 && isset($order->pay_amount) && $order->pay_amount > 0) {
                    $orderAmount = floatval($order->pay_amount);
                }

                $purchases[] = [
                    'id' => $order->id,
                    'orderNo' => $order->order_number ?? ('ORD-' . $order->id),
                    'title' => $title,
                    'amount' => $orderAmount,
                    'at' => $order->created_at ? date('Y-m-d', strtotime($order->created_at)) : date('Y-m-d'),
                    'status' => $order->status === 'refunded' ? 'refunded' : ($order->status === 'completed' || $order->status === 'delivered' ? 'completed' : $order->status),
                ];
            }

            return response()->json([
                'status' => true,
                'message' => 'Purchase history fetched successfully.',
                'data' => $purchases,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching purchase history.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get reward transactions (gift sent/received history)
     */
    public function getRewardTransactions(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check if reward_transactions table exists
            if (!Schema::hasTable('reward_transactions')) {
                return response()->json([
                    'status' => true,
                    'message' => 'Transactions fetched successfully.',
                    'data' => [],
                ]);
            }

            $transactions = DB::table('reward_transactions')
                ->where('user_id', $request->user_id)
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedTransactions = [];
            foreach ($transactions as $txn) {
                $type = $txn->type;
                $description = $txn->description;
                
                // Format description based on type
                if ($type === 'gift_sent') {
                    $giftCode = DB::table('gift_codes')->where('id', $txn->gift_code_id)->first();
                    if ($giftCode) {
                        $toContact = $giftCode->to_email ?: $giftCode->to_phone;
                        $description = 'Gift sent to ' . $toContact;
                    }
                } elseif ($type === 'gift_received') {
                    $giftCode = DB::table('gift_codes')->where('id', $txn->gift_code_id)->first();
                    if ($giftCode) {
                        $fromUser = DB::table('users')->where('id', $giftCode->from_user_id)->first();
                        $description = 'Gift received from ' . ($fromUser->name ?? 'Unknown');
                    }
                } elseif ($type === 'purchase') {
                    $description = 'Points earned from purchase';
                } elseif ($type === 'redeem_code') {
                    // Check if it's a gift card redemption or reward code redemption
                    if (strpos($description, 'Gift card redeemed') !== false) {
                        $description = $description; // Keep original description with code
                    } else {
                        $description = 'Code redeemed: ' . ($description ?? 'Gift code');
                    }
                }

                $formattedTransactions[] = [
                    'id' => $txn->id,
                    'type' => $type,
                    'points' => $txn->points,
                    'description' => $description,
                    'at' => $txn->created_at ? date('Y-m-d H:i:s', strtotime($txn->created_at)) : date('Y-m-d H:i:s'),
                ];
            }

            return response()->json([
                'status' => true,
                'message' => 'Transactions fetched successfully.',
                'data' => $formattedTransactions,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching transactions.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send gift (generate code and deduct points)
     */
    public function sendGift(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'points' => 'required|integer|min:1',
                'to_email' => 'nullable|email|max:255',
                'to_phone' => 'nullable|string|max:50',
                'message' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            if (!$request->to_email && !$request->to_phone) {
                return response()->json([
                    'status' => false,
                    'message' => 'Either email or phone must be provided',
                ], 422);
            }

            DB::beginTransaction();

            // Check user balance
            $user = DB::table('users')->where('id', $request->user_id)->lockForUpdate()->first();
            $currentPoints = (int)($user->reward_points ?? 0);
            $pointsToSend = (int)$request->points;

            if ($currentPoints < $pointsToSend) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Insufficient points',
                ], 400);
            }

            // Generate unique gift code
            $code = $this->generateGiftCode();

            // Check if user exists by email or phone
            $toUserId = null;
            if ($request->to_email) {
                $toUser = DB::table('users')->where('email', $request->to_email)->first();
                $toUserId = $toUser->id ?? null;
            } elseif ($request->to_phone) {
                $toUser = DB::table('users')->where('phone', $request->to_phone)->first();
                $toUserId = $toUser->id ?? null;
            }

            // Create gift code (expires in 14 days)
            $expiresAt = now()->addDays(14);
            $giftCodeId = DB::table('gift_codes')->insertGetId([
                'code' => $code,
                'from_user_id' => $request->user_id,
                'to_email' => $request->to_email,
                'to_phone' => $request->to_phone,
                'to_user_id' => $toUserId,
                'points' => $pointsToSend,
                'message' => $request->message,
                'status' => 'pending',
                'expires_at' => $expiresAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Deduct points from sender
            DB::table('users')
                ->where('id', $request->user_id)
                ->update([
                    'reward_points' => $currentPoints - $pointsToSend,
                    'updated_at' => now(),
                ]);

            // Create transaction record
            DB::table('reward_transactions')->insert([
                'user_id' => $request->user_id,
                'type' => 'gift_sent',
                'points' => -$pointsToSend,
                'gift_code_id' => $giftCodeId,
                'description' => 'Gift sent to ' . ($request->to_email ?: $request->to_phone),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Gift sent successfully.',
                'data' => [
                    'code' => $code,
                    'points' => $pointsToSend,
                    'expires_at' => $expiresAt->toDateTimeString(),
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error sending gift.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Redeem gift code
     */
    public function redeemGift(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'code' => 'required|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            // Find gift code
            $code = strtoupper(trim($request->code));
            $giftCode = DB::table('gift_codes')
                ->where('code', $code)
                ->lockForUpdate()
                ->first();

            if (!$giftCode) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid code',
                ], 404);
            }

            // Check if code is already redeemed
            if ($giftCode->status === 'redeemed') {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Code already used',
                ], 400);
            }

            // Check if code is expired
            if (now()->greaterThan($giftCode->expires_at)) {
                DB::table('gift_codes')
                    ->where('id', $giftCode->id)
                    ->update(['status' => 'expired', 'updated_at' => now()]);
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'This gift code has expired',
                ], 400);
            }

            // Check if user is trying to redeem their own gift
            if ($giftCode->from_user_id == $request->user_id) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'You cannot redeem your own gift',
                ], 400);
            }

            // Update gift code status
            DB::table('gift_codes')
                ->where('id', $giftCode->id)
                ->update([
                    'status' => 'redeemed',
                    'to_user_id' => $request->user_id,
                    'redeemed_at' => now(),
                    'updated_at' => now(),
                ]);

            // Add points to recipient
            $user = DB::table('users')->where('id', $request->user_id)->lockForUpdate()->first();
            $currentPoints = (int)($user->reward_points ?? 0);
            $pointsToAdd = (int)$giftCode->points;

            DB::table('users')
                ->where('id', $request->user_id)
                ->update([
                    'reward_points' => $currentPoints + $pointsToAdd,
                    'updated_at' => now(),
                ]);

            // Create transaction record
            $fromUser = DB::table('users')->where('id', $giftCode->from_user_id)->first();
            DB::table('reward_transactions')->insert([
                'user_id' => $request->user_id,
                'type' => 'gift_received',
                'points' => $pointsToAdd,
                'gift_code_id' => $giftCode->id,
                'description' => 'Gift received from ' . ($fromUser->name ?? 'Unknown'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Code redeemed successfully.',
                'data' => [
                    'points' => $pointsToAdd,
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error redeeming code.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Award points on purchase (1 BHD = 1 point)
     * This method should be called when an order is completed/delivered
     */
    public static function awardPointsOnPurchase($userId, $orderId, $amountBHD)
    {
        try {
            // Check if reward_transactions table exists
            $hasTransactionTable = Schema::hasTable('reward_transactions');
            
            if ($hasTransactionTable) {
                // Check if points were already awarded for this order
                $existingTxn = DB::table('reward_transactions')
                    ->where('user_id', $userId)
                    ->where('order_id', $orderId)
                    ->where('type', 'purchase')
                    ->first();

                if ($existingTxn) {
                    return false; // Already awarded
                }
            }

            DB::beginTransaction();

            // Calculate points (1 BHD = 1 point)
            $pointsToAward = (int)floor($amountBHD);

            if ($pointsToAward > 0) {
                // Add points to user
                $user = DB::table('users')->where('id', $userId)->lockForUpdate()->first();
                $currentPoints = (int)($user->reward_points ?? 0);

                DB::table('users')
                    ->where('id', $userId)
                    ->update([
                        'reward_points' => $currentPoints + $pointsToAward,
                        'updated_at' => now(),
                    ]);

                // Create transaction record (only if table exists)
                if ($hasTransactionTable) {
                    DB::table('reward_transactions')->insert([
                        'user_id' => $userId,
                        'type' => 'purchase',
                        'points' => $pointsToAward,
                        'order_id' => $orderId,
                        'description' => 'Points earned from purchase',
                        'amount_bhd' => $amountBHD,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Error awarding points on purchase: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Award points for completed order (can be called when order status changes)
     */
    public function awardPointsForOrder(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|exists:orders,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $order = Order::find($request->order_id);
            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            // Only award points if order is completed or delivered
            if (!in_array($order->status, ['completed', 'delivered'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Points can only be awarded for completed or delivered orders',
                ], 400);
            }

            // Calculate order amount
            $amountBHD = floatval($order->pay_amount ?? 0);
            if ($amountBHD <= 0) {
                // Try to calculate from cart if pay_amount is not available
                $cart = is_string($order->cart) ? json_decode($order->cart, true) : $order->cart;
                if ($cart) {
                    $items = [];
                    if (is_array($cart) && isset($cart[0]) && !isset($cart['items'])) {
                        $items = $cart;
                    } elseif (isset($cart['items'])) {
                        $itemsData = $cart['items'];
                        if (is_array($itemsData) && isset($itemsData[0])) {
                            $items = $itemsData;
                        } elseif (is_object($itemsData) || (is_array($itemsData) && !isset($itemsData[0]))) {
                            $items = array_values($itemsData);
                        }
                    }
                    foreach ($items as $item) {
                        $amount = 0;
                        $qty = 1;
                        if (isset($item['item']) && is_array($item['item'])) {
                            $productData = $item['item'];
                            $amount = isset($item['price']) ? floatval($item['price']) : (isset($productData['price']) ? floatval($productData['price']) : 0);
                            $qty = isset($item['qty']) ? intval($item['qty']) : 1;
                        } elseif (isset($item['id']) || isset($item['product_id'])) {
                            $amount = isset($item['price']) ? floatval($item['price']) : 0;
                            $qty = isset($item['qty']) ? intval($item['qty']) : (isset($item['quantity']) ? intval($item['quantity']) : 1);
                        }
                        $amountBHD += $amount * $qty;
                    }
                }
            }

            $result = self::awardPointsOnPurchase($order->user_id, $order->id, $amountBHD);

            if ($result) {
                return response()->json([
                    'status' => true,
                    'message' => 'Points awarded successfully.',
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Points already awarded or error occurred',
                ], 400);
            }

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error awarding points.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate unique gift code (format: XXXX-XXXX)
     */
    private function generateGiftCode()
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1
        $maxAttempts = 100;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $part1 = '';
            $part2 = '';
            for ($j = 0; $j < 4; $j++) {
                $part1 .= $characters[random_int(0, strlen($characters) - 1)];
                $part2 .= $characters[random_int(0, strlen($characters) - 1)];
            }
            $code = $part1 . '-' . $part2;

            // Check if code already exists
            $exists = DB::table('gift_codes')->where('code', $code)->exists();
            if (!$exists) {
                return $code;
            }
        }

        throw new Exception('Failed to generate unique gift code');
    }
}

