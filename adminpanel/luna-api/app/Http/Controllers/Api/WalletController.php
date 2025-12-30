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
     * For now, return empty array as this might need a separate transactions table
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

            // TODO: Implement transactions table if needed
            // For now, return empty array
            return response()->json([
                'status' => true,
                'message' => 'Transactions fetched successfully.',
                'data' => [],
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching transactions.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

