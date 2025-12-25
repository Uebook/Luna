<?php

namespace App\Http\Controllers\Celebrity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CelebrityDashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:celebrity');
    }

    /**
     * Dashboard
     */
    public function index()
    {
        $userId = Auth::guard('celebrity')->id();
        $gs = \App\Models\Generalsetting::findOrFail(1);
        
        // Sales statistics
        $totalSales = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.user_id', $userId)
            ->where('orders.payment_status', 'paid')
            ->sum('order_items.price');

        $totalOrders = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.user_id', $userId)
            ->distinct('orders.id')
            ->count('orders.id');

        $totalProducts = DB::table('products')
            ->where('user_id', $userId)
            ->count();

        $activeStreams = DB::table('live_streams')
            ->where('user_id', $userId)
            ->where('status', 'live')
            ->count();

        // Recent orders
        $recentOrders = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('products.user_id', $userId)
            ->select('orders.*')
            ->distinct()
            ->orderBy('orders.created_at', 'desc')
            ->limit(10)
            ->get();

        return view('celebrity.dashboard', compact(
            'gs',
            'totalSales',
            'totalOrders',
            'totalProducts',
            'activeStreams',
            'recentOrders'
        ));
    }
}


