<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\LiveStream;
use App\Models\StreamProduct;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Validator;
use Datatables;
use DB;

class LiveStreamController extends AdminBaseController
{
    // List all live streams
    public function index(Request $request)
    {
        $users = User::where('is_provider', 1)->orWhere('is_vendor', 2)->select('id', 'name', 'email')->get();
        return view('admin.livestream.index', compact('users'));
    }

    // Show create form
    public function create()
    {
        $users = User::where('is_provider', 1)->orWhere('is_vendor', 2)->select('id', 'name', 'email')->get();
        return view('admin.livestream.create', compact('users'));
    }

    // Store new stream
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'channel_name' => 'nullable|string|unique:live_streams,channel_name',
        ]);

        if ($validator->fails()) {
            if ($request->ajax()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        // Generate unique channel name if not provided
        $channelName = $request->channel_name ?? 'stream_' . time() . '_' . uniqid();

        $stream = LiveStream::create([
            'user_id' => $request->user_id,
            'channel_name' => $channelName,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->start_now ? 'live' : 'scheduled',
            'viewer_count' => 0,
            'likes_count' => 0,
            'started_at' => $request->start_now ? now() : null,
        ]);

        $msg = 'Live stream created successfully.';
        if ($request->ajax()) {
            return response()->json(['success' => true, 'message' => $msg, 'redirect' => route('admin-livestream-index')]);
        }
        return redirect()->route('admin-livestream-index')
            ->with('success', $msg);
    }

    // Start an existing stream
    public function start($id)
    {
        $stream = LiveStream::findOrFail($id);
        
        if ($stream->status === 'live') {
            return redirect()->route('admin-livestream-index')
                ->with('error', 'Stream is already live.');
        }

        $stream->update([
            'status' => 'live',
            'started_at' => now(),
        ]);

        return redirect()->route('admin-livestream-index')
            ->with('success', 'Stream started successfully.');
    }

    // Datatables for streams
    public function datatables(Request $request)
    {
        $datas = LiveStream::with(['user:id,name,email', 'products'])
            ->latest('id')
            ->get();

        return Datatables::of($datas)
            ->editColumn('title', function (LiveStream $data) {
                return '<a href="' . route('admin-livestream-show', $data->id) . '">' . $data->title . '</a>';
            })
            ->editColumn('user_id', function (LiveStream $data) {
                return $data->user ? $data->user->name : 'N/A';
            })
            ->editColumn('status', function (LiveStream $data) {
                $status = $data->status == 'live' ? '<span class="badge badge-success">Live</span>' : 
                         ($data->status == 'ended' ? '<span class="badge badge-danger">Ended</span>' : 
                         '<span class="badge badge-warning">Scheduled</span>');
                return $status;
            })
            ->editColumn('viewer_count', function (LiveStream $data) {
                return $data->viewer_count;
            })
            ->editColumn('likes_count', function (LiveStream $data) {
                return $data->likes_count;
            })
            ->editColumn('started_at', function (LiveStream $data) {
                return $data->started_at ? $data->started_at->format('Y-m-d H:i:s') : 'N/A';
            })
            ->addColumn('products_count', function (LiveStream $data) {
                return $data->products->count();
            })
            ->addColumn('action', function (LiveStream $data) {
                $action = '<div class="action-list">
                    <a href="' . route('admin-livestream-show', $data->id) . '" class="btn btn-primary btn-sm">
                        <i class="fas fa-eye"></i> View
                    </a>
                    <a href="' . route('admin-livestream-products', $data->id) . '" class="btn btn-info btn-sm">
                        <i class="fas fa-box"></i> Products
                    </a>';
                
                if ($data->status !== 'live') {
                    $action .= '<a href="' . route('admin-livestream-start', $data->id) . '" class="btn btn-success btn-sm" onclick="return confirm(\'Start this stream?\')">
                        <i class="fas fa-play"></i> Start
                    </a>';
                }
                
                if ($data->status === 'live') {
                    $action .= '<a href="' . route('admin-livestream-end', $data->id) . '" class="btn btn-warning btn-sm" onclick="return confirm(\'End this stream?\')">
                        <i class="fas fa-stop"></i> End
                    </a>';
                }
                
                $action .= '</div>';
                return $action;
            })
            ->rawColumns(['title', 'status', 'action'])
            ->toJson();
    }

    // Show stream details
    public function show($id)
    {
        $stream = LiveStream::with(['user', 'productsWithDetails.product'])
            ->findOrFail($id);
        
        return view('admin.livestream.show', compact('stream'));
    }

    // Manage products for a stream
    public function products($id)
    {
        $stream = LiveStream::with(['productsWithDetails.product'])
            ->findOrFail($id);
        
        return view('admin.livestream.products', compact('stream'));
    }

    // Get available products for adding
    public function getAvailableProducts(Request $request, $id)
    {
        $stream = LiveStream::findOrFail($id);
        
        $addedProductIds = StreamProduct::where('stream_id', $id)
            ->pluck('product_id')
            ->toArray();

        $products = Product::whereNotIn('id', $addedProductIds)
            ->where('status', 1)
            ->select('id', 'name', 'sku', 'price', 'thumbnail')
            ->get();

        return response()->json(['success' => true, 'products' => $products]);
    }

    // Add product to stream
    public function addProduct(Request $request, $id)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'is_featured' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $stream = LiveStream::findOrFail($id);
        
        // Check if already added
        $exists = StreamProduct::where('stream_id', $id)
            ->where('product_id', $request->product_id)
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Product already added']);
        }

        $maxOrder = StreamProduct::where('stream_id', $id)->max('display_order') ?? 0;

        StreamProduct::create([
            'stream_id' => $id,
            'product_id' => $request->product_id,
            'display_order' => $request->display_order ?? ($maxOrder + 1),
            'is_featured' => $request->is_featured ?? false,
        ]);

        return response()->json(['success' => true, 'message' => 'Product added successfully']);
    }

    // Remove product from stream
    public function removeProduct(Request $request, $id, $productId)
    {
        StreamProduct::where('stream_id', $id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Product removed successfully']);
    }

    // Update product order
    public function updateProductOrder(Request $request, $id)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'display_order' => 'nullable|integer',
            'is_featured' => 'nullable|boolean',
        ]);

        $streamProduct = StreamProduct::where('stream_id', $id)
            ->where('product_id', $request->product_id)
            ->firstOrFail();

        if ($request->has('display_order')) {
            $streamProduct->display_order = $request->display_order;
        }
        if ($request->has('is_featured')) {
            $streamProduct->is_featured = $request->is_featured;
        }

        $streamProduct->save();

        return response()->json(['success' => true, 'message' => 'Product updated successfully']);
    }

    // End stream
    public function endStream($id)
    {
        $stream = LiveStream::findOrFail($id);
        $stream->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        return redirect()->route('admin-livestream-index')
            ->with('success', 'Stream ended successfully');
    }

    // Delete stream
    public function destroy($id)
    {
        $stream = LiveStream::findOrFail($id);
        $stream->delete();

        return redirect()->route('admin-livestream-index')
            ->with('success', 'Stream deleted successfully');
    }
}


