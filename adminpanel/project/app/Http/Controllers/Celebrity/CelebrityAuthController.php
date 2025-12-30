<?php

namespace App\Http\Controllers\Celebrity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use DB;

class CelebrityAuthController extends Controller
{
    /**
     * Show login form
     */
    public function showLoginForm()
    {
        return view('celebrity.auth.login');
    }

    /**
     * Handle login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if user is a celebrity/vendor
        $user = User::where('email', $request->email)
            ->where('is_provider', 1)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors(['email' => 'Invalid credentials or not a celebrity account'])->withInput();
        }

        // Login as celebrity
        Auth::guard('celebrity')->login($user);

        return redirect()->route('celebrity.dashboard');
    }

    /**
     * Logout
     */
    public function logout()
    {
        Auth::guard('celebrity')->logout();
        return redirect()->route('celebrity.login');
    }
}



