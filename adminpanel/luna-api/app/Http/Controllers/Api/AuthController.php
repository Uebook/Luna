<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'first_name' => 'required',
        'last_name'  => 'nullable',
        'email'      => 'required|email',
        'phone'      => 'required',
        'currency'   => 'nullable|string|max:3',
        'language'   => 'nullable|string',
        'photo'      => 'nullable|image',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
    }

    // ✅ Check if email or phone already exists
    $existingUser = User::where('email', $request->email)
        ->orWhere('phone', $request->phone)
        ->first();

    // ✅ Case 1: User exists & email is verified → Tell user to login
    if ($existingUser && $existingUser->email_verified=="Yes") {
        return response()->json([
            'status' => false,
            'message' => 'User already registered and verified. Please login.'
        ], 409);
    }

    // ✅ Case 2: User exists but NOT verified → Resend OTP
    if ($existingUser && $existingUser->email_verified=="No") {
        $existingUser->otp = rand(100000, 999999);
        $existingUser->otp_expired_at = Carbon::now()->addMinutes(10);
        $existingUser->save();

        Mail::raw("Your OTP is: " . $existingUser->otp, function ($message) use ($existingUser) {
            $message->to($existingUser->email)->subject('Verify Your Account');
        });

        return response()->json([
            'status' => true,
            'message' => 'This email/phone is already registered but not verified. OTP sent again.',
            'user_exists' => true,
            'is_verified' => false
        ]);
    }

    // ✅ Case 3: New user → Create user & send OTP
    $user = new User();
    $user->first_name = $request->first_name;
    $user->last_name  = $request->last_name;
    $user->name       = $request->first_name . ' ' . $request->last_name;
    $user->email      = $request->email;
    $user->phone      = $request->phone;
    $user->currency   = $request->currency;
    $user->language   = $request->language;
    $user->email_verified = 'No';
    
    // Set default contact preferences (all enabled by default)
    $user->notif_new_msg = true;
    $user->email_promo = true;
    $user->sms_promo = true;
    $user->wa_promo = true;

    // ✅ Handle photo upload
    if ($request->hasFile('photo')) {
        $path = public_path('uploads/profile/');
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }
        $filename = time() . '_' . $request->photo->getClientOriginalName();
        $request->photo->move($path, $filename);
        $user->photo = 'uploads/profile/' . $filename;
    }

    // ✅ Generate OTP for email verification
    $user->otp = rand(100000, 999999);
    $user->otp_expired_at = Carbon::now()->addMinutes(10);
    $user->save();

    Mail::raw("Your OTP is: " . $user->otp, function ($message) use ($user) {
        $message->to($user->email)->subject('Your OTP Code');
    });

    return response()->json([
        'status' => true,
        'message' => 'Registered successfully! OTP sent to email.',
        'user_exists' => false,
        'is_verified' => false
    ]);
}


   public function login(Request $request)
{
    $validator = Validator::make($request->all(), [
        'email_phone' => 'required',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }

    // Get user by email or phone
    $user = User::where('email', $request->email_phone)
        ->orWhere('phone', $request->email_phone)
        ->first();

    if (!$user) {
        return response()->json(['status' => false, 'message' => 'User not found!'], 404);
    }

    // ✅ Check if user is verified or not
    if ($user->email_verified !== 'Yes') {
        return response()->json([
            'status' => false,
            'message' => 'Email not verified. Please verify your account before login.'
        ], 403);
    }

    // ✅ If verified, generate OTP for login
    $user->otp = rand(100000, 999999);
    $user->otp_expired_at = Carbon::now()->addMinutes(10);
    $user->save();

    // Send OTP via Mail
    Mail::raw("Your login OTP is: " . $user->otp, function ($message) use ($user) {
        $message->to($user->email)->subject('Login OTP');
    });

    return response()->json([
        'status' => true,
        'message' => 'OTP sent to your email'
    ]);
}


    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_phone' => 'required',
            'otp'         => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where(function ($q) use ($request) {
            $q->where('email', $request->email_phone)
                ->orWhere('phone', $request->email_phone);
        })
            ->where('otp', $request->otp)
            ->where('otp_expired_at', '>=', Carbon::now())
            ->first();

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Invalid or expired OTP'], 400);
        }

        $user->otp = null;
        $user->otp_expired_at = null;
        $user->email_verified = 'Yes';
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'OTP verified successfully',
            'user'  => $user
        ]);
    }

   public function updateProfile(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_id'    => 'required|exists:users,id',
        'first_name' => 'sometimes|required|string|max:100',
        'last_name'  => 'sometimes|nullable|string|max:100',
        'email'      => 'sometimes|required|email|unique:users,email,' . $request->user_id,
        'phone'      => 'sometimes|required|unique:users,phone,' . $request->user_id,
        'zip'        => 'nullable|string|max:20',
        'city'       => 'nullable|string|max:100',
        'country'    => 'nullable|string|max:100',
        'address'    => 'nullable|string|max:255',
        'currency'   => 'nullable|string|max:3',
        'language'   => 'nullable|string|max:20',
        'date'       => 'nullable|date', 
        'photo'      => 'nullable|image',
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }

    $user = User::find($request->user_id);

    $emailChanged = $request->has('email') && $request->email !== $user->email;

    // ✅ Update allowed fields only
    $user->first_name = $request->first_name ?? $user->first_name;
    $user->last_name  = $request->last_name ?? $user->last_name;
    $user->name       = trim(($request->first_name ?? $user->first_name) . ' ' . ($request->last_name ?? $user->last_name));
    $user->email      = $request->email ?? $user->email;
    $user->phone      = $request->phone ?? $user->phone;
    $user->zip        = $request->zip ?? $user->zip;
    $user->city       = $request->city ?? $user->city;
    $user->country    = $request->country ?? $user->country;
    $user->address    = $request->address ?? $user->address;
    $user->currency   = $request->currency ?? $user->currency;
    $user->language   = $request->language ?? $user->language;
    $user->date       = $request->date ?? $user->date;

    // ✅ Handle photo upload
    if ($request->hasFile('photo')) {
        $path = public_path('uploads/profile/');
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }
        $filename = time() . '_' . $request->photo->getClientOriginalName();
        $request->photo->move($path, $filename);
        $user->photo = 'uploads/profile/' . $filename;
    }

    // ✅ If email changed, mark unverified & send new OTP
    if ($emailChanged) {
        $user->email_verified = 'No';
        $user->otp = rand(100000, 999999);
        $user->otp_expired_at = Carbon::now()->addMinutes(10);

        Mail::raw("Your new email verification OTP is: " . $user->otp, function ($message) use ($user) {
            $message->to($user->email)->subject('Verify Your New Email');
        });
    }

    $user->save();

    $message = $emailChanged 
        ? 'Profile updated successfully. Please verify your new email using the OTP sent.'
        : 'Profile updated successfully.';

    return response()->json([
        'status' => true,
        'message' => $message,
        'user' => $user
    ]);
}

}
