<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    /**
     * Get user addresses
     */
    public function getAddresses(Request $request)
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

        $addresses = DB::table('user_addresses')
            ->where('user_id', $request->user_id)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'addresses' => $addresses,
        ]);
    }

    /**
     * Add new address
     */
    public function addAddress(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If this is default, unset other defaults
        if ($request->is_default) {
            DB::table('user_addresses')
                ->where('user_id', $request->user_id)
                ->update(['is_default' => false]);
        }

        $addressId = DB::table('user_addresses')->insertGetId([
            'user_id' => $request->user_id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'country' => $request->country,
            'postal_code' => $request->postal_code,
            'is_default' => $request->is_default ?? false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $address = DB::table('user_addresses')->find($addressId);

        return response()->json([
            'success' => true,
            'message' => 'Address added successfully',
            'address' => $address,
        ]);
    }

    /**
     * Update address
     */
    public function updateAddress(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $address = DB::table('user_addresses')
            ->where('id', $id)
            ->where('user_id', $request->user_id)
            ->first();

        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Address not found',
            ], 404);
        }

        $updateData = [];
        foreach ($request->all() as $key => $value) {
            if ($key !== 'user_id' && $value !== null) {
                $updateData[$key] = $value;
            }
        }

        // If setting as default, unset other defaults
        if (isset($updateData['is_default']) && $updateData['is_default']) {
            DB::table('user_addresses')
                ->where('user_id', $request->user_id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $updateData['updated_at'] = now();
        DB::table('user_addresses')
            ->where('id', $id)
            ->update($updateData);

        $updatedAddress = DB::table('user_addresses')->find($id);

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully',
            'address' => $updatedAddress,
        ]);
    }

    /**
     * Delete address
     */
    public function deleteAddress(Request $request, $id)
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

        $deleted = DB::table('user_addresses')
            ->where('id', $id)
            ->where('user_id', $request->user_id)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Address deleted successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Address not found',
        ], 404);
    }

    /**
     * Set default address
     */
    public function setDefault(Request $request, $id)
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

        // Unset all defaults
        DB::table('user_addresses')
            ->where('user_id', $request->user_id)
            ->update(['is_default' => false]);

        // Set this as default
        $updated = DB::table('user_addresses')
            ->where('id', $id)
            ->where('user_id', $request->user_id)
            ->update(['is_default' => true, 'updated_at' => now()]);

        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => 'Default address set successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Address not found',
        ], 404);
    }
}



