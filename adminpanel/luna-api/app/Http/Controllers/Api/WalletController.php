<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
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

            // Get reward points (balance) - check if field exists
            // Try to get reward field, fallback to 0 if not exists
            $rewardPoints = 0;
            if (property_exists($user, 'reward') && $user->reward !== null) {
                $rewardPoints = (int)$user->reward;
            } elseif (property_exists($user, 'balance') && $user->balance !== null) {
                $rewardPoints = (int)$user->balance;
            }
            
            // Convert to BHD (assuming 1 point = 0.01 BHD, can be made configurable)
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
                    'points_to_bhd_ratio' => 0.01, // Can be made dynamic from settings
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
            if (!DB::getSchemaBuilder()->hasTable('reward_transactions')) {
                return response()->json([
                    'status' => true,
                    'message' => 'Transactions fetched successfully.',
                    'data' => [],
                ]);
            }

            $transactions = DB::table('reward_transactions')
                ->where('user_id', $request->user_id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($tx) {
                    $giftCode = null;
                    if ($tx->gift_code_id) {
                        $giftCode = DB::table('gift_codes')->where('id', $tx->gift_code_id)->first();
                    }
                    
                    $fromUser = null;
                    $toUser = null;
                    if ($giftCode) {
                        if ($giftCode->from_user_id) {
                            $fromUser = DB::table('users')->where('id', $giftCode->from_user_id)->first();
                        }
                        if ($giftCode->to_user_id) {
                            $toUser = DB::table('users')->where('id', $giftCode->to_user_id)->first();
                        }
                    }

                    return [
                        'id' => $tx->id,
                        'type' => $tx->type,
                        'points' => $tx->points,
                        'note' => $tx->note ?? ($fromUser ? $fromUser->email : ($toUser ? $toUser->email : null)),
                        'at' => $tx->created_at ? date('Y-m-d', strtotime($tx->created_at)) : date('Y-m-d'),
                        'gift_code' => $giftCode ? $giftCode->code : null,
                    ];
                });

            return response()->json([
                'status' => true,
                'message' => 'Transactions fetched successfully.',
                'data' => $transactions,
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
     * Send gift (create gift code)
     */
    public function sendGift(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'points' => 'required|integer|min:1',
                'recipient' => 'required|string', // email or phone
                'message' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check if gift_codes table exists
            if (!DB::getSchemaBuilder()->hasTable('gift_codes')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Gift system not available.',
                ], 503);
            }

            $user = DB::table('users')->where('id', $request->user_id)->first();
            $rewardPoints = property_exists($user, 'reward_points') ? (int)$user->reward_points : 
                          (property_exists($user, 'reward') ? (int)$user->reward : 
                          (property_exists($user, 'balance') ? (int)$user->balance : 0));

            if ($rewardPoints < $request->points) {
                return response()->json([
                    'status' => false,
                    'message' => 'Insufficient points.',
                ], 400);
            }

            // Generate unique gift code
            $code = $this->generateGiftCode();
            $expiresAt = date('Y-m-d H:i:s', strtotime('+14 days'));

            DB::beginTransaction();

            // Create gift code
            $giftCodeId = DB::table('gift_codes')->insertGetId([
                'code' => $code,
                'from_user_id' => $request->user_id,
                'points' => $request->points,
                'message' => $request->message,
                'recipient' => $request->recipient,
                'status' => 'pending',
                'expires_at' => $expiresAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Deduct points from sender
            if (DB::getSchemaBuilder()->hasColumn('users', 'reward_points')) {
                DB::table('users')->where('id', $request->user_id)->decrement('reward_points', $request->points);
            } elseif (DB::getSchemaBuilder()->hasColumn('users', 'reward')) {
                DB::table('users')->where('id', $request->user_id)->decrement('reward', $request->points);
            } elseif (DB::getSchemaBuilder()->hasColumn('users', 'balance')) {
                DB::table('users')->where('id', $request->user_id)->decrement('balance', $request->points);
            }

            // Create transaction record
            if (DB::getSchemaBuilder()->hasTable('reward_transactions')) {
                DB::table('reward_transactions')->insert([
                    'user_id' => $request->user_id,
                    'type' => 'gift_sent',
                    'points' => -$request->points,
                    'gift_code_id' => $giftCodeId,
                    'note' => $request->recipient,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Gift code created successfully.',
                'data' => [
                    'code' => $code,
                    'points' => $request->points,
                    'expires_at' => $expiresAt,
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error creating gift code.',
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
                'code' => 'required|string|regex:/^[A-Z0-9]{4}-[A-Z0-9]{4}$/',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check if gift_codes table exists
            if (!DB::getSchemaBuilder()->hasTable('gift_codes')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Gift system not available.',
                ], 503);
            }

            $code = strtoupper(trim($request->code));
            $giftCode = DB::table('gift_codes')->where('code', $code)->first();

            if (!$giftCode) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid code.',
                ], 404);
            }

            if ($giftCode->status === 'redeemed') {
                return response()->json([
                    'status' => false,
                    'message' => 'Code already used.',
                ], 400);
            }

            if ($giftCode->from_user_id == $request->user_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'You cannot redeem your own gift.',
                ], 400);
            }

            if ($giftCode->expires_at && strtotime($giftCode->expires_at) < time()) {
                DB::table('gift_codes')->where('id', $giftCode->id)->update(['status' => 'expired']);
                return response()->json([
                    'status' => false,
                    'message' => 'This gift code has expired.',
                ], 400);
            }

            DB::beginTransaction();

            // Update gift code
            DB::table('gift_codes')->where('id', $giftCode->id)->update([
                'status' => 'redeemed',
                'to_user_id' => $request->user_id,
                'redeemed_at' => now(),
                'updated_at' => now(),
            ]);

            // Add points to receiver
            if (DB::getSchemaBuilder()->hasColumn('users', 'reward_points')) {
                DB::table('users')->where('id', $request->user_id)->increment('reward_points', $giftCode->points);
            } elseif (DB::getSchemaBuilder()->hasColumn('users', 'reward')) {
                DB::table('users')->where('id', $request->user_id)->increment('reward', $giftCode->points);
            } elseif (DB::getSchemaBuilder()->hasColumn('users', 'balance')) {
                DB::table('users')->where('id', $request->user_id)->increment('balance', $giftCode->points);
            }

            // Create transaction record
            if (DB::getSchemaBuilder()->hasTable('reward_transactions')) {
                $fromUser = DB::table('users')->where('id', $giftCode->from_user_id)->first();
                DB::table('reward_transactions')->insert([
                    'user_id' => $request->user_id,
                    'type' => 'gift_received',
                    'points' => $giftCode->points,
                    'gift_code_id' => $giftCode->id,
                    'note' => $fromUser ? $fromUser->email : $giftCode->recipient,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Gift code redeemed successfully.',
                'data' => [
                    'points' => $giftCode->points,
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error redeeming gift code.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get received gifts
     */
    public function getReceivedGifts(Request $request)
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

            // Check if gift_codes table exists
            if (!DB::getSchemaBuilder()->hasTable('gift_codes')) {
                return response()->json([
                    'status' => true,
                    'message' => 'Received gifts fetched successfully.',
                    'data' => [],
                ]);
            }

            $gifts = DB::table('gift_codes')
                ->where('to_user_id', $request->user_id)
                ->where('status', 'redeemed')
                ->orderBy('redeemed_at', 'desc')
                ->get()
                ->map(function ($gift) {
                    $fromUser = null;
                    if ($gift->from_user_id) {
                        $fromUser = DB::table('users')->where('id', $gift->from_user_id)->first();
                    }

                    return [
                        'id' => $gift->id,
                        'code' => $gift->code,
                        'points' => $gift->points,
                        'message' => $gift->message,
                        'from' => $fromUser ? $fromUser->email : $gift->recipient,
                        'redeemed_at' => $gift->redeemed_at ? date('Y-m-d', strtotime($gift->redeemed_at)) : null,
                        'created_at' => $gift->created_at ? date('Y-m-d', strtotime($gift->created_at)) : null,
                    ];
                });

            return response()->json([
                'status' => true,
                'message' => 'Received gifts fetched successfully.',
                'data' => $gifts,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching received gifts.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate unique gift code
     */
    private function generateGiftCode()
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1
        $code = '';
        
        do {
            $code = '';
            for ($i = 0; $i < 4; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $code .= '-';
            for ($i = 0; $i < 4; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
        } while (DB::table('gift_codes')->where('code', $code)->exists());

        return $code;
    }
}

