<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;
use App\Http\Controllers\Api\WalletController;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id'           => 'required|exists:users,id',
                'cart'              => 'required|json',
                'method'            => 'required|string|max:100',
                'shipping'          => 'nullable|string|max:255',
                'pickup_location'   => 'nullable|string|max:255',
                'totalQty'          => 'required|integer|min:1',
                'pay_amount'        => 'required|numeric|min:0',
                'customer_email'    => 'required|email|max:255',
                'customer_name'     => 'required|string|max:255',
                'customer_country'  => 'nullable|string|max:100',
                'customer_phone'    => 'nullable|string|max:50',
                'customer_address'  => 'nullable|string|max:255',
                'customer_city'     => 'nullable|string|max:100',
                'customer_zip'      => 'nullable|string|max:20',
                'shipping_name'     => 'nullable|string|max:255',
                'shipping_country'  => 'nullable|string|max:100',
                'shipping_email'    => 'nullable|email|max:255',
                'shipping_phone'    => 'nullable|string|max:50',
                'shipping_address'  => 'nullable|string|max:255',
                'shipping_city'     => 'nullable|string|max:100',
                'shipping_zip'      => 'nullable|string|max:20',
                'order_note'        => 'nullable|string|max:500',
                'coupon_code'       => 'nullable|string|max:100',
                'coupon_discount'   => 'nullable|numeric',
                'currency_sign'     => 'nullable|string|max:10',
                'currency_name'     => 'nullable|string|max:50',
                'currency_value'    => 'nullable|numeric',
                'shipping_cost'     => 'nullable|numeric',
                'packing_cost'      => 'nullable|numeric',
                'tax'               => 'nullable|numeric',
                'tax_location'      => 'nullable|string|max:100',
                'discount'          => 'nullable|numeric',
                'riders'            => 'nullable|string|max:255',
                'commission'        => 'nullable|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $input = $request->all();
            $cart = json_decode($request->cart, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid cart JSON format',
                ], 400);
            }

            // Generate order info
            $input['order_number'] = 'ORD-' . strtoupper(Str::random(10));
            $input['txnid'] = $request->txnid ?? (string) Str::uuid();
            $input['status'] = 'pending';
            $input['payment_status'] = $request->payment_status ?? 'pending';

            DB::beginTransaction();

            $order = Order::create($input);

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Order placed successfully!',
                'data'    => [
                    'order_id'      => $order->id,
                    'order_number'  => $order->order_number,
                    'txnid'         => $order->txnid,
                    'totalQty'      => $order->totalQty,
                    'pay_amount'    => $order->pay_amount,
                    'status'        => $order->status,
                ]
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Server Error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

  
    public function myOrders(Request $request)
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

            $orders = Order::where('user_id', $request->user_id)
                ->orderBy('id', 'desc')
                ->paginate(10);

            if ($orders->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No orders found for this user.',
                    'data' => [],
                ], 404);
            }

            $orders->getCollection()->transform(function ($order) {
                $order->cart = json_decode($order->cart);
                return $order;
            });

            return response()->json([
                'status' => true,
                'message' => 'Orders fetched successfully.',
                'data' => $orders,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching orders.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getActivityStats(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'year' => 'nullable|integer|min:2000|max:2100',
                'month' => 'nullable|integer|min:0|max:11', // 0-11 for month index
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $userId = $request->user_id;
            $year = $request->year ?? date('Y');
            $month = $request->month !== null ? (int)$request->month : date('n') - 1; // Convert to 0-11
            $monthNum = $month + 1; // Convert back to 1-12 for DB query

            // Get orders for the specified year and month
            $startDate = sprintf('%04d-%02d-01 00:00:00', $year, $monthNum);
            $endDate = date('Y-m-t 23:59:59', strtotime($startDate));

            $orders = Order::where('user_id', $userId)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            // Initialize category totals
            $categoryTotals = [];
            $orderedCount = $orders->count();
            $receivedCount = 0;
            $toReceiveCount = 0;

            // Process each order
            foreach ($orders as $order) {
                // Count by status
                if ($order->status === 'delivered' || $order->status === 'completed') {
                    $receivedCount++;
                } else {
                    $toReceiveCount++;
                }

                // Parse cart data to get category spending
                $cart = is_string($order->cart) ? json_decode($order->cart, true) : $order->cart;
                
                if (!$cart) {
                    continue;
                }

                // Handle different cart formats - similar to HistoryScreen logic
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

                foreach ($items as $item) {
                    // Get product data - handle different structures
                    $productId = null;
                    $qty = 1;
                    $amount = 0;

                    // Try different formats to extract product ID and price
                    if (isset($item['item']) && is_array($item['item'])) {
                        // Format: {item: {id, name, price}, qty, price}
                        $productData = $item['item'];
                        $productId = $productData['id'] ?? $productData['product_id'] ?? null;
                        $qty = isset($item['qty']) ? intval($item['qty']) : 1;
                        // Use item price if available, otherwise product price
                        $amount = isset($item['price']) ? floatval($item['price']) : (isset($productData['price']) ? floatval($productData['price']) : 0);
                    } elseif (isset($item['id']) || isset($item['product_id'])) {
                        // Direct product format: {id, product_id, price, qty, quantity}
                        $productId = $item['id'] ?? $item['product_id'] ?? null;
                        $qty = isset($item['qty']) ? intval($item['qty']) : (isset($item['quantity']) ? intval($item['quantity']) : 1);
                        $amount = isset($item['price']) ? floatval($item['price']) : 0;
                    } else {
                        // Skip items without product ID
                        continue;
                    }

                    if (!$productId) {
                        continue;
                    }

                    // Get product category
                    $product = DB::table('products')->where('id', $productId)->first();
                    if (!$product || !$product->category_id) {
                        continue;
                    }

                    // Get category info
                    $category = DB::table('categories')->where('id', $product->category_id)->first();
                    if (!$category) {
                        continue;
                    }

                    $categoryKey = strtolower(str_replace([' ', '-', '_'], '_', $category->slug ?? $category->name));
                    $categoryName = $category->name;
                    $totalAmount = $amount * $qty;

                    if (!isset($categoryTotals[$categoryKey])) {
                        // Assign colors to categories (can be made dynamic later)
                        $colors = ['#0A55FF', '#95C93D', '#FF7B00', '#F45CA5', '#9C27B0', '#E91E63', '#00BCD4', '#4CAF50'];
                        $colorIndex = count($categoryTotals) % count($colors);
                        
                        $categoryTotals[$categoryKey] = [
                            'key' => $categoryKey,
                            'label' => $categoryName,
                            'color' => $colors[$colorIndex],
                            'amount' => 0,
                        ];
                    }

                    $categoryTotals[$categoryKey]['amount'] += $totalAmount;
                }
            }

            // Convert category totals to array and sort by amount (descending)
            $categories = array_values($categoryTotals);
            usort($categories, function($a, $b) {
                return $b['amount'] - $a['amount'];
            });

            // Take top 8 categories
            $categories = array_slice($categories, 0, 8);

            return response()->json([
                'status' => true,
                'message' => 'Activity statistics fetched successfully.',
                'data' => [
                    'categories' => $categories,
                    'counters' => [
                        'ordered' => $orderedCount,
                        'received' => $receivedCount,
                        'toReceive' => $toReceiveCount,
                    ],
                ],
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching activity statistics.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update order status and award points if order is completed/delivered
     */
    public function updateOrderStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|exists:orders,id',
                'status' => 'required|string|in:pending,processing,shipped,delivered,completed,cancelled,refunded',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            $order = Order::find($request->order_id);
            if (!$order) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found',
                ], 404);
            }

            $oldStatus = $order->status;
            $newStatus = $request->status;

            // Update order status
            $order->status = $newStatus;
            $order->save();

            // Award points if order status changed to completed or delivered
            if (in_array($newStatus, ['completed', 'delivered']) && !in_array($oldStatus, ['completed', 'delivered'])) {
                $amountBHD = floatval($order->pay_amount ?? 0);
                if ($amountBHD <= 0) {
                    // Calculate from cart if pay_amount is not available
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

                // Award points (1 BHD = 1 point)
                WalletController::awardPointsOnPurchase($order->user_id, $order->id, $amountBHD);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Order status updated successfully.',
                'data' => [
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ],
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error updating order status.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
