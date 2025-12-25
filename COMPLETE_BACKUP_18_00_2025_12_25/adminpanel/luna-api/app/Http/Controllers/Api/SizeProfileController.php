<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;

class SizeProfileController extends Controller
{
    /**
     * Get user's size profile
     */
    public function getSizeProfile(Request $request)
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

            // Check if column exists
            $hasSizeProfile = Schema::hasColumn('users', 'size_profile');
            
            $sizeProfile = null;
            if ($hasSizeProfile && $user->size_profile) {
                // Decode JSON if it's a string
                if (is_string($user->size_profile)) {
                    $sizeProfile = json_decode($user->size_profile, true);
                } else {
                    $sizeProfile = $user->size_profile;
                }
            }

            return response()->json([
                'status' => true,
                'message' => 'Size profile fetched successfully',
                'data' => $sizeProfile
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching size profile: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error fetching size profile'
            ], 500);
        }
    }

    /**
     * Save/Update user's size profile
     */
    public function saveSizeProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'type' => 'required|in:adult,kid',
            // Adult fields
            'tab' => 'nullable|in:Man,Woman',
            'body_shape' => 'nullable|string',
            'height_cm' => 'nullable|numeric',
            'weight_kg' => 'nullable|numeric',
            'bust_cm' => 'nullable|numeric',
            'waist_cm' => 'nullable|numeric',
            'hips_cm' => 'nullable|numeric',
            'fit_preference' => 'nullable|in:tts,slim,relaxed',
            // Kid fields
            'gender' => 'nullable|in:boy,girl,na',
            'age' => 'nullable|integer',
            'chest_pref' => 'nullable|in:none,tts',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            // Check if column exists
            if (!Schema::hasColumn('users', 'size_profile')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Size profile feature is not available. Please run the migration.'
                ], 400);
            }

            $user = User::find($request->user_id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Build size profile based on type
            $sizeProfile = [];
            
            if ($request->type === 'kid') {
                $sizeProfile = [
                    'type' => 'kid',
                    'gender' => $request->gender ?? null,
                    'age' => $request->age ?? null,
                    'height_cm' => $request->height_cm ?? null,
                    'weight_kg' => $request->weight_kg ?? null,
                    'chest_pref' => $request->chest_pref ?? null,
                ];
            } else {
                $sizeProfile = [
                    'type' => 'adult',
                    'tab' => $request->tab ?? null,
                    'body_shape' => $request->body_shape ?? null,
                    'height_cm' => $request->height_cm ?? null,
                    'weight_kg' => $request->weight_kg ?? null,
                    'bust_cm' => $request->bust_cm ?? null,
                    'waist_cm' => $request->waist_cm ?? null,
                    'hips_cm' => $request->hips_cm ?? null,
                    'fit_preference' => $request->fit_preference ?? null,
                ];
            }

            // Remove null values to keep JSON clean
            $sizeProfile = array_filter($sizeProfile, function($value) {
                return $value !== null;
            });

            // Save to database
            $user->size_profile = json_encode($sizeProfile);
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Size profile saved successfully',
                'data' => $sizeProfile
            ]);
        } catch (\Exception $e) {
            \Log::error('Error saving size profile: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Error saving size profile'
            ], 500);
        }
    }
}

