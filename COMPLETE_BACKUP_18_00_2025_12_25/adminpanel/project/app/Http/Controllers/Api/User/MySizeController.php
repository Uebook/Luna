<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserSize;
use Auth;
use Illuminate\Http\Request;
use Validator;

class MySizeController extends Controller
{
    /**
     * Get user's size data
     */
    public function get(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();
            $userSize = UserSize::where('user_id', $user->id)->first();
            
            if ($userSize) {
                return response()->json([
                    'status' => true,
                    'data' => $userSize,
                    'error' => []
                ]);
            } else {
                return response()->json([
                    'status' => true,
                    'data' => null,
                    'error' => []
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => [],
                'error' => ['message' => $e->getMessage()]
            ]);
        }
    }

    /**
     * Add or update user's size data
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();
            
            // Validation rules
            $rules = [
                'name' => 'nullable|string|max:255',
                'chest' => 'nullable|numeric|min:0',
                'waist' => 'nullable|numeric|min:0',
                'hips' => 'nullable|numeric|min:0',
                'shoulder' => 'nullable|numeric|min:0',
                'arm_length' => 'nullable|numeric|min:0',
                'leg_length' => 'nullable|numeric|min:0',
                'neck' => 'nullable|numeric|min:0',
                'bicep' => 'nullable|numeric|min:0',
                'thigh' => 'nullable|numeric|min:0',
                'shirt_size' => 'nullable|string|max:10',
                'pant_size' => 'nullable|string|max:10',
                'shoe_size' => 'nullable|string|max:10',
                'notes' => 'nullable|string',
            ];

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'data' => [],
                    'error' => $validator->errors()
                ]);
            }

            // Check if user already has a size record
            $userSize = UserSize::where('user_id', $user->id)->first();

            $input = $request->all();
            $input['user_id'] = $user->id;

            if ($userSize) {
                // Update existing record
                $userSize->update($input);
                $message = 'Size updated successfully.';
            } else {
                // Create new record
                $userSize = UserSize::create($input);
                $message = 'Size added successfully.';
            }

            return response()->json([
                'status' => true,
                'data' => $userSize,
                'message' => $message,
                'error' => []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => [],
                'error' => ['message' => $e->getMessage()]
            ]);
        }
    }

    /**
     * Update user's size data
     */
    public function update(Request $request)
    {
        try {
            $user = Auth::guard('api')->user();
            
            // Validation rules
            $rules = [
                'name' => 'nullable|string|max:255',
                'chest' => 'nullable|numeric|min:0',
                'waist' => 'nullable|numeric|min:0',
                'hips' => 'nullable|numeric|min:0',
                'shoulder' => 'nullable|numeric|min:0',
                'arm_length' => 'nullable|numeric|min:0',
                'leg_length' => 'nullable|numeric|min:0',
                'neck' => 'nullable|numeric|min:0',
                'bicep' => 'nullable|numeric|min:0',
                'thigh' => 'nullable|numeric|min:0',
                'shirt_size' => 'nullable|string|max:10',
                'pant_size' => 'nullable|string|max:10',
                'shoe_size' => 'nullable|string|max:10',
                'notes' => 'nullable|string',
            ];

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'data' => [],
                    'error' => $validator->errors()
                ]);
            }

            $userSize = UserSize::where('user_id', $user->id)->first();

            if (!$userSize) {
                return response()->json([
                    'status' => false,
                    'data' => [],
                    'error' => ['message' => 'Size record not found. Please add your size first.']
                ]);
            }

            $input = $request->all();
            $userSize->update($input);

            return response()->json([
                'status' => true,
                'data' => $userSize,
                'message' => 'Size updated successfully.',
                'error' => []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'data' => [],
                'error' => ['message' => $e->getMessage()]
            ]);
        }
    }
}
