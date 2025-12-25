<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ContactPreferencesController extends Controller
{
    /**
     * Get user's contact preferences
     */
    public function getPreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $user = User::find($request->user_id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Check if columns exist (handle case where migration hasn't been run)
            $notifNewMsg = isset($user->notif_new_msg) ? (bool) $user->notif_new_msg : true;
            $emailPromo = isset($user->email_promo) ? (bool) $user->email_promo : true;
            $smsPromo = isset($user->sms_promo) ? (bool) $user->sms_promo : true;
            $waPromo = isset($user->wa_promo) ? (bool) $user->wa_promo : true;
            $promoEmail = isset($user->promo_email) ? $user->promo_email : null;
            $smsPhone = isset($user->sms_phone) ? $user->sms_phone : null;
            $waPhone = isset($user->wa_phone) ? $user->wa_phone : null;

            return response()->json([
                'status' => true,
                'message' => 'Contact preferences fetched successfully',
                'data' => [
                    'notif_new_msg' => $notifNewMsg,
                    'email_promo' => $emailPromo,
                    'sms_promo' => $smsPromo,
                    'wa_promo' => $waPromo,
                    'email' => $promoEmail ?? $user->email ?? '',
                    'sms_phone' => $smsPhone ?? $user->phone ?? '',
                    'wa_phone' => $waPhone ?? $user->phone ?? '',
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching contact preferences: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching contact preferences'
            ], 500);
        }
    }

    /**
     * Save/Update user's contact preferences
     */
    public function savePreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'notif_new_msg' => 'nullable|boolean',
            'email_promo' => 'nullable|boolean',
            'sms_promo' => 'nullable|boolean',
            'wa_promo' => 'nullable|boolean',
            'email' => 'nullable|email|max:255',
            'sms_phone' => 'nullable|string|max:20',
            'wa_phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $user = User::find($request->user_id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Check if columns exist before updating
            $columns = Schema::getColumnListing('users');
            $hasContactPrefColumns = in_array('notif_new_msg', $columns);

            // Update preferences (only update if provided and columns exist)
            if ($hasContactPrefColumns) {
                if ($request->has('notif_new_msg')) {
                    $user->notif_new_msg = $request->notif_new_msg ? 1 : 0;
                }
                if ($request->has('email_promo')) {
                    $user->email_promo = $request->email_promo ? 1 : 0;
                }
                if ($request->has('sms_promo')) {
                    $user->sms_promo = $request->sms_promo ? 1 : 0;
                }
                if ($request->has('wa_promo')) {
                    $user->wa_promo = $request->wa_promo ? 1 : 0;
                }
            }

            // Update contact details (only if provided and not empty)
            // Update contact details (only if columns exist)
            if ($hasContactPrefColumns) {
                if ($request->has('email') && !empty($request->email)) {
                    // Validate email format
                    if (!filter_var($request->email, FILTER_VALIDATE_EMAIL)) {
                        return response()->json([
                            'status' => false,
                            'message' => 'Invalid email format'
                        ], 422);
                    }
                    $user->promo_email = $request->email;
                }

                if ($request->has('sms_phone') && !empty($request->sms_phone)) {
                    // Basic phone validation (8-15 digits)
                    $phone = preg_replace('/[\s-]/', '', $request->sms_phone);
                    if (!preg_match('/^\+?\d{8,15}$/', $phone)) {
                        return response()->json([
                            'status' => false,
                            'message' => 'Invalid SMS phone number format'
                        ], 422);
                    }
                    $user->sms_phone = $request->sms_phone;
                }

                if ($request->has('wa_phone') && !empty($request->wa_phone)) {
                    // Basic phone validation (8-15 digits)
                    $phone = preg_replace('/[\s-]/', '', $request->wa_phone);
                    if (!preg_match('/^\+?\d{8,15}$/', $phone)) {
                        return response()->json([
                            'status' => false,
                            'message' => 'Invalid WhatsApp phone number format'
                        ], 422);
                    }
                    $user->wa_phone = $request->wa_phone;
                }
            }

            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Contact preferences saved successfully',
                'data' => [
                    'notif_new_msg' => (bool) $user->notif_new_msg,
                    'email_promo' => (bool) $user->email_promo,
                    'sms_promo' => (bool) $user->sms_promo,
                    'wa_promo' => (bool) $user->wa_promo,
                    'email' => $user->promo_email ?? $user->email ?? '',
                    'sms_phone' => $user->sms_phone ?? $user->phone ?? '',
                    'wa_phone' => $user->wa_phone ?? $user->phone ?? '',
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error saving contact preferences: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error saving contact preferences'
            ], 500);
        }
    }
}

