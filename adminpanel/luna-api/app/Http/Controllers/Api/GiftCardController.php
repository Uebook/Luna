<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class GiftCardController extends Controller
{
    /**
     * Get all active gift cards
     */
    public function getGiftCards(Request $request)
    {
        try {
            $giftCards = DB::table('gift_cards')
                ->where('status', 1)
                ->orderBy('sort_order', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedCards = $giftCards->map(function ($card) {
                // Generate full image URL
                $imageUrl = null;
                if ($card->image) {
                    // Check if image already contains full URL
                    if (filter_var($card->image, FILTER_VALIDATE_URL)) {
                        $imageUrl = $card->image;
                    } else {
                        // Generate full URL
                        $baseUrl = rtrim(config('app.url'), '/');
                        $imageUrl = $baseUrl . '/assets/images/giftcards/' . $card->image;
                    }
                }
                
                return [
                    'id' => $card->id,
                    'title' => $card->title,
                    'description' => $card->description,
                    'image' => $imageUrl,
                    'price' => (float) $card->price,
                    'value' => (float) $card->value,
                    'discount' => $card->discount_percentage ? (float) $card->discount_percentage : null,
                    'validity_days' => $card->validity_days,
                    'status' => $card->status,
                    'created_at' => $card->created_at,
                ];
            });

            return response()->json([
                'status' => true,
                'gift_cards' => $formattedCards
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching gift cards: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Purchase a gift card
     */
    public function purchaseGiftCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'gift_card_id' => 'required|exists:gift_cards,id',
            'recipient_email' => 'nullable|email',
            'recipient_name' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Get gift card
            $giftCard = DB::table('gift_cards')
                ->where('id', $request->gift_card_id)
                ->where('status', 1)
                ->first();

            if (!$giftCard) {
                return response()->json([
                    'status' => false,
                    'message' => 'Gift card not found or inactive'
                ], 404);
            }

            // Generate unique gift card code
            $code = $this->generateGiftCardCode();

            // Create gift card purchase record
            $purchaseId = DB::table('gift_card_purchases')->insertGetId([
                'user_id' => $request->user_id,
                'gift_card_id' => $request->gift_card_id,
                'code' => $code,
                'value' => $giftCard->value,
                'remaining_value' => $giftCard->value,
                'recipient_email' => $request->recipient_email,
                'recipient_name' => $request->recipient_name,
                'message' => $request->message,
                'status' => 'active',
                'expires_at' => $giftCard->validity_days ? 
                    date('Y-m-d H:i:s', strtotime('+' . $giftCard->validity_days . ' days')) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // TODO: Process payment here
            // For now, we'll just create the purchase record

            return response()->json([
                'status' => true,
                'message' => 'Gift card purchased successfully',
                'purchase_id' => $purchaseId,
                'code' => $code,
                'gift_card' => [
                    'id' => $giftCard->id,
                    'title' => $giftCard->title,
                    'value' => $giftCard->value,
                    'code' => $code,
                    'expires_at' => $giftCard->validity_days ? 
                        date('Y-m-d H:i:s', strtotime('+' . $giftCard->validity_days . ' days')) : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error purchasing gift card: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's purchased gift cards
     */
    public function getUserGiftCards(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $purchases = DB::table('gift_card_purchases')
                ->join('gift_cards', 'gift_card_purchases.gift_card_id', '=', 'gift_cards.id')
                ->where('gift_card_purchases.user_id', $request->user_id)
                ->select(
                    'gift_card_purchases.*',
                    'gift_cards.title',
                    'gift_cards.description',
                    'gift_cards.image'
                )
                ->orderBy('gift_card_purchases.created_at', 'desc')
                ->get();

            $formattedPurchases = $purchases->map(function ($purchase) {
                $isExpired = $purchase->expires_at && strtotime($purchase->expires_at) < time();
                $status = $isExpired ? 'expired' : ($purchase->remaining_value <= 0 ? 'used' : $purchase->status);

                // Generate full image URL
                $imageUrl = null;
                if ($purchase->image) {
                    if (filter_var($purchase->image, FILTER_VALIDATE_URL)) {
                        $imageUrl = $purchase->image;
                    } else {
                        $baseUrl = rtrim(config('app.url'), '/');
                        $imageUrl = $baseUrl . '/assets/images/giftcards/' . $purchase->image;
                    }
                }

                return [
                    'id' => $purchase->id,
                    'code' => $purchase->code,
                    'title' => $purchase->title,
                    'description' => $purchase->description,
                    'image' => $imageUrl,
                    'value' => (float) $purchase->value,
                    'remaining_value' => (float) $purchase->remaining_value,
                    'status' => $status,
                    'expires_at' => $purchase->expires_at,
                    'recipient_email' => $purchase->recipient_email,
                    'recipient_name' => $purchase->recipient_name,
                    'message' => $purchase->message,
                    'created_at' => $purchase->created_at,
                ];
            });

            return response()->json([
                'status' => true,
                'gift_cards' => $formattedPurchases
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching user gift cards: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate/Use gift card code
     */
    public function validateGiftCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $purchase = DB::table('gift_card_purchases')
                ->where('code', $request->code)
                ->first();

            if (!$purchase) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid gift card code'
                ], 404);
            }

            $isExpired = $purchase->expires_at && strtotime($purchase->expires_at) < time();
            
            if ($isExpired) {
                return response()->json([
                    'status' => false,
                    'message' => 'Gift card has expired'
                ], 400);
            }

            if ($purchase->status !== 'active' || $purchase->remaining_value <= 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Gift card is already used or inactive'
                ], 400);
            }

            return response()->json([
                'status' => true,
                'message' => 'Gift card is valid',
                'gift_card' => [
                    'code' => $purchase->code,
                    'remaining_value' => (float) $purchase->remaining_value,
                    'expires_at' => $purchase->expires_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error validating gift card: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique gift card code
     */
    private function generateGiftCardCode()
    {
        do {
            $code = 'GC-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
            $exists = DB::table('gift_card_purchases')->where('code', $code)->exists();
        } while ($exists);

        return $code;
    }
}

