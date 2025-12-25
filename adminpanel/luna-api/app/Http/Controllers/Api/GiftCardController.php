<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;

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

            // Use base URL without luna-api
            $baseUrl = 'https://proteinbros.in';

            $formattedCards = $giftCards->map(function ($card) use ($baseUrl) {
                // Generate full image URL
                $imageUrl = null;
                if ($card->image) {
                    // Check if image already contains full URL
                    if (filter_var($card->image, FILTER_VALIDATE_URL)) {
                        $imageUrl = $card->image;
                        // Remove luna-api from URL if present
                        $imageUrl = str_replace('/luna-api', '', $imageUrl);
                        $imageUrl = str_replace('luna-api/', '', $imageUrl);
                    } else {
                        // Generate full URL without luna-api
                        $imageUrl = rtrim($baseUrl, '/') . '/assets/images/giftcards/' . ltrim($card->image, '/');
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
            'recipient_phone' => 'nullable|string|max:20',
            'recipient_name' => 'required|string|max:255',
            'message' => 'nullable|string|max:500',
            'amount' => 'required|numeric|min:0.001',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get gift card
            $giftCard = DB::table('gift_cards')
                ->where('id', $request->gift_card_id)
                ->where('status', 1)
                ->first();

            if (!$giftCard) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Gift card not found or inactive'
                ], 404);
            }

            // Use custom amount if provided, otherwise use gift card value
            $amount = floatval($request->amount ?? $giftCard->value);

            // Check if recipient email or phone exists in users table
            $recipientUserId = null;
            if ($request->recipient_email) {
                $user = DB::table('users')
                    ->where('email', $request->recipient_email)
                    ->first();
                if ($user) {
                    $recipientUserId = $user->id;
                }
            } elseif ($request->recipient_phone) {
                $user = DB::table('users')
                    ->where('phone', $request->recipient_phone)
                    ->first();
                if ($user) {
                    $recipientUserId = $user->id;
                }
            }

            // Generate unique gift card code
            $code = $this->generateGiftCardCode();

            // Create gift card purchase record
            // Check which columns exist in the database
            $hasRecipientPhone = \Schema::hasColumn('gift_card_purchases', 'recipient_phone');
            $hasRecipientUserId = \Schema::hasColumn('gift_card_purchases', 'recipient_user_id');
            
            $purchaseData = [
                'user_id' => $request->user_id,
                'gift_card_id' => $request->gift_card_id,
                'code' => $code,
                'value' => $amount,
                'remaining_value' => $amount,
                'recipient_email' => $request->recipient_email,
                'recipient_name' => $request->recipient_name,
                'message' => $request->message,
                'status' => 'active',
                'expires_at' => $giftCard->validity_days ? 
                    date('Y-m-d H:i:s', strtotime('+' . $giftCard->validity_days . ' days')) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            // Only add these columns if they exist
            if ($hasRecipientPhone && $request->recipient_phone) {
                $purchaseData['recipient_phone'] = $request->recipient_phone;
            }
            
            if ($hasRecipientUserId && $recipientUserId) {
                $purchaseData['recipient_user_id'] = $recipientUserId;
            }
            
            $purchaseId = DB::table('gift_card_purchases')->insertGetId($purchaseData);

            // Generate image URL without luna-api
            $imageUrl = null;
            if ($giftCard->image) {
                $baseUrl = 'https://proteinbros.in';
                $imageUrl = rtrim($baseUrl, '/') . '/assets/images/giftcards/' . ltrim($giftCard->image, '/');
            }

            DB::commit();

            // TODO: Process payment here
            // TODO: Send notification to recipient if user_id is found

            return response()->json([
                'status' => true,
                'message' => 'Gift card purchased successfully',
                'data' => [
                    'purchase_id' => $purchaseId,
                    'code' => $code,
                    'amount' => $amount,
                    'expires_at' => $giftCard->validity_days ? 
                        date('Y-m-d H:i:s', strtotime('+' . $giftCard->validity_days . ' days')) : null,
                    'gift_card' => [
                        'id' => $giftCard->id,
                        'title' => $giftCard->title,
                        'image' => $imageUrl,
                    ],
                    'recipient' => [
                        'name' => $request->recipient_name,
                        'email' => $request->recipient_email,
                        'phone' => $request->recipient_phone,
                        'user_id' => $recipientUserId,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
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

            // Get base URL from request
            $baseUrl = 'https://proteinbros.in';

            $formattedPurchases = $purchases->map(function ($purchase) use ($baseUrl) {
                $isExpired = $purchase->expires_at && strtotime($purchase->expires_at) < time();
                $status = $isExpired ? 'expired' : ($purchase->remaining_value <= 0 ? 'used' : $purchase->status);

                // Generate full image URL
                $imageUrl = null;
                if ($purchase->image) {
                    if (filter_var($purchase->image, FILTER_VALIDATE_URL)) {
                        $imageUrl = $purchase->image;
                        // Remove luna-api from URL if present
                        $imageUrl = str_replace('/luna-api', '', $imageUrl);
                        $imageUrl = str_replace('luna-api/', '', $imageUrl);
                    } else {
                        $imageUrl = rtrim($baseUrl, '/') . '/assets/images/giftcards/' . ltrim($purchase->image, '/');
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
     * Get received gift cards for a user
     */
    public function getReceivedGiftCards(Request $request)
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
            // Get gift cards where recipient_user_id matches, or recipient email/phone matches user
            $user = DB::table('users')->where('id', $request->user_id)->first();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Check which columns exist
            $hasRecipientUserId = Schema::hasColumn('gift_card_purchases', 'recipient_user_id');
            $hasRecipientPhone = Schema::hasColumn('gift_card_purchases', 'recipient_phone');

            $purchases = DB::table('gift_card_purchases')
                ->join('gift_cards', 'gift_card_purchases.gift_card_id', '=', 'gift_cards.id')
                ->leftJoin('users as sender', 'gift_card_purchases.user_id', '=', 'sender.id')
                ->where(function($query) use ($request, $user, $hasRecipientUserId, $hasRecipientPhone) {
                    // Check if recipient_user_id matches (if column exists)
                    if ($hasRecipientUserId) {
                        $query->where('gift_card_purchases.recipient_user_id', $request->user_id);
                    }
                    // Or recipient email matches
                    $query->orWhere(function($q) use ($user) {
                        if (isset($user->email) && $user->email) {
                            $q->where('gift_card_purchases.recipient_email', $user->email);
                        }
                    });
                    // Or recipient phone matches (if column exists)
                    if ($hasRecipientPhone) {
                        $query->orWhere(function($q) use ($user) {
                            if (isset($user->phone) && $user->phone) {
                                $q->where('gift_card_purchases.recipient_phone', $user->phone);
                            }
                        });
                    }
                })
                ->select(
                    'gift_card_purchases.*',
                    'gift_cards.id as gift_card_template_id',
                    'gift_cards.title',
                    'gift_cards.description',
                    'gift_cards.image',
                    'sender.name as sender_name',
                    'sender.email as sender_email'
                )
                ->orderBy('gift_card_purchases.created_at', 'desc')
                ->get();

            // Get base URL from request
            $baseUrl = 'https://proteinbros.in';

            $formattedPurchases = $purchases->map(function ($purchase) use ($baseUrl) {
                $isExpired = $purchase->expires_at && strtotime($purchase->expires_at) < time();
                $status = $isExpired ? 'expired' : ($purchase->remaining_value <= 0 || $purchase->status === 'used' ? 'used' : $purchase->status);

                // Generate full image URL
                $imageUrl = null;
                if ($purchase->image) {
                    if (filter_var($purchase->image, FILTER_VALIDATE_URL)) {
                        $imageUrl = $purchase->image;
                        // Remove luna-api from URL if present
                        $imageUrl = str_replace('/luna-api', '', $imageUrl);
                        $imageUrl = str_replace('luna-api/', '', $imageUrl);
                    } else {
                        $imageUrl = rtrim($baseUrl, '/') . '/assets/images/giftcards/' . ltrim($purchase->image, '/');
                    }
                }

                return [
                    'id' => $purchase->id,
                    'code' => $purchase->code,
                    'gift_card_id' => $purchase->gift_card_id, // Template ID
                    'title' => $purchase->title,
                    'description' => $purchase->description,
                    'image' => $imageUrl,
                    'gift_card' => [
                        'id' => $purchase->gift_card_id, // Template ID for reference
                        'template_id' => isset($purchase->gift_card_template_id) ? $purchase->gift_card_template_id : $purchase->gift_card_id,
                        'title' => $purchase->title,
                        'description' => $purchase->description ?? null,
                        'image' => $imageUrl,
                    ],
                    'sender_name' => $purchase->sender_name ?? null,
                    'sender_email' => $purchase->sender_email ?? null,
                    'value' => (float) $purchase->value,
                    'remaining_value' => (float) $purchase->remaining_value,
                    'status' => $status,
                    'expires_at' => $purchase->expires_at ?? null,
                    'redeemed_at' => isset($purchase->redeemed_at) ? $purchase->redeemed_at : null,
                    'recipient_name' => $purchase->recipient_name ?? null,
                    'recipient_email' => $purchase->recipient_email ?? null,
                    'recipient_phone' => isset($purchase->recipient_phone) ? $purchase->recipient_phone : null,
                    'message' => $purchase->message ?? null,
                    'created_at' => $purchase->created_at,
                ];
            });

            return response()->json([
                'status' => true,
                'message' => 'Received gift cards fetched successfully',
                'data' => $formattedPurchases
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error fetching received gift cards: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Redeem gift card - Add value to user's wallet/reward points
     */
    public function redeemGiftCard(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
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
            DB::beginTransaction();

            // Find gift card
            $purchase = DB::table('gift_card_purchases')
                ->where('code', $request->code)
                ->lockForUpdate()
                ->first();

            if (!$purchase) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid gift card code'
                ], 404);
            }

            // Check if already redeemed (check status first)
            if ($purchase->status === 'used') {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'This gift card has already been redeemed'
                ], 400);
            }

            // Check if gift card is expired
            $isExpired = $purchase->expires_at && strtotime($purchase->expires_at) < time();
            if ($isExpired) {
                DB::table('gift_card_purchases')
                    ->where('id', $purchase->id)
                    ->update(['status' => 'expired', 'updated_at' => now()]);
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'This gift card has expired'
                ], 400);
            }

            // Check if gift card is valid and has remaining value
            if ($purchase->status !== 'active' || $purchase->remaining_value <= 0) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Gift card is already used or inactive'
                ], 400);
            }

            $remainingValue = (float) $purchase->remaining_value;

            // Add gift card value to user's reward points (1 BHD = 1 point)
            $user = DB::table('users')->where('id', $request->user_id)->lockForUpdate()->first();
            $currentPoints = isset($user->reward_points) ? (int)$user->reward_points : 0;
            $pointsToAdd = (int)floor($remainingValue);

            // Update user reward points
            DB::table('users')
                ->where('id', $request->user_id)
                ->update([
                    'reward_points' => $currentPoints + $pointsToAdd,
                    'updated_at' => now(),
                ]);

            // Mark gift card as redeemed
            $updateData = [
                'status' => 'used',
                'remaining_value' => 0,
                'updated_at' => now(),
            ];
            
            // Add redeemed fields if columns exist (optional fields)
            if (Schema::hasColumn('gift_card_purchases', 'redeemed_by_user_id')) {
                $updateData['redeemed_by_user_id'] = $request->user_id;
            }
            if (Schema::hasColumn('gift_card_purchases', 'redeemed_at')) {
                $updateData['redeemed_at'] = now();
            }
            
            DB::table('gift_card_purchases')
                ->where('id', $purchase->id)
                ->update($updateData);

            // Create reward transaction record (only if table exists)
            if (Schema::hasTable('reward_transactions')) {
                DB::table('reward_transactions')->insert([
                    'user_id' => $request->user_id,
                    'type' => 'redeem_code',
                    'points' => $pointsToAdd,
                    'description' => 'Gift card redeemed: ' . $purchase->code,
                    'amount_bhd' => $remainingValue,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Gift card redeemed successfully',
                'data' => [
                    'points_added' => $pointsToAdd,
                    'value_bhd' => $remainingValue,
                    'code' => $purchase->code,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Error redeeming gift card: ' . $e->getMessage()
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

