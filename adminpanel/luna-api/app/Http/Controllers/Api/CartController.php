<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function getCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $cart = DB::table('carts')
            ->where('user_id', $request->user_id)
            ->join('products', 'carts.product_id', '=', 'products.id')
            ->select(
                'carts.*',
                'products.name',
                'products.sku',
                'products.price',
                'products.thumbnail',
                'products.photo',
                'products.stock'
            )
            ->get();

        $total = $cart->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'total' => $total,
            'item_count' => $cart->count(),
        ]);
    }

    /**
     * Add product to cart
     */
    public function addToCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $quantity = $request->quantity ?? 1;

        // Check if product already in cart
        $existing = DB::table('carts')
            ->where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            // Update quantity
            DB::table('carts')
                ->where('id', $existing->id)
                ->update([
                    'quantity' => $existing->quantity + $quantity,
                    'updated_at' => now(),
                ]);
        } else {
            // Add new item
            DB::table('carts')->insert([
                'user_id' => $request->user_id,
                'product_id' => $request->product_id,
                'quantity' => $quantity,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product added to cart',
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function updateCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updated = DB::table('carts')
            ->where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->update([
                'quantity' => $request->quantity,
                'updated_at' => now(),
            ]);

        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => 'Cart updated',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Item not found in cart',
        ], 404);
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $deleted = DB::table('carts')
            ->where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Item not found in cart',
        ], 404);
    }

    /**
     * Clear entire cart
     */
    public function clearCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::table('carts')
            ->where('user_id', $request->user_id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
        ]);
    }
}



