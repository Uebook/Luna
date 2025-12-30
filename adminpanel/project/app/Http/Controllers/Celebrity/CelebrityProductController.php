<?php

namespace App\Http\Controllers\Celebrity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use Datatables;
use Validator;
use Image;

class CelebrityProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:celebrity');
    }

    /**
     * List products
     */
    public function index()
    {
        return view('celebrity.products.index');
    }

    /**
     * Datatables
     */
    public function datatables()
    {
        $userId = Auth::guard('celebrity')->id();
        $datas = Product::where('user_id', $userId)->latest('id')->get();

        return Datatables::of($datas)
            ->editColumn('name', function (Product $data) {
                return $data->name;
            })
            ->editColumn('price', function (Product $data) {
                return '$' . number_format($data->price, 2);
            })
            ->editColumn('stock', function (Product $data) {
                return $data->stock ?? 'Unlimited';
            })
            ->editColumn('status', function (Product $data) {
                $status = $data->status == 1 ? '<span class="badge badge-success">Active</span>' : 
                         '<span class="badge badge-danger">Inactive</span>';
                return $status;
            })
            ->addColumn('action', function (Product $data) {
                return '<div class="action-list">
                    <a href="' . route('celebrity.products.edit', $data->id) . '" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <a href="javascript:;" data-href="' . route('celebrity.products.delete', $data->id) . '" 
                       class="btn btn-danger btn-sm delete">
                        <i class="fas fa-trash"></i> Delete
                    </a>
                </div>';
            })
            ->rawColumns(['status', 'action'])
            ->toJson();
    }

    /**
     * Create form
     */
    public function create()
    {
        $categories = DB::table('categories')->where('status', 1)->get();
        return view('celebrity.products.create', compact('categories'));
    }

    /**
     * Store product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $userId = Auth::guard('celebrity')->id();

        $product = Product::create([
            'user_id' => $userId,
            'name' => $request->name,
            'price' => $request->price,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'stock' => $request->stock,
            'status' => $request->status ?? 1,
            'type' => 'Physical',
        ]);

        // Handle image upload
        if ($request->hasFile('thumbnail')) {
            $image = $request->file('thumbnail');
            $filename = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('assets/images/products'), $filename);
            $product->thumbnail = $filename;
            $product->save();
        }

        return redirect()->route('celebrity.products.index')
            ->with('success', 'Product created successfully');
    }

    /**
     * Edit form
     */
    public function edit($id)
    {
        $userId = Auth::guard('celebrity')->id();
        $product = Product::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
        
        $categories = DB::table('categories')->where('status', 1)->get();
        return view('celebrity.products.edit', compact('product', 'categories'));
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $userId = Auth::guard('celebrity')->id();
        $product = Product::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $product->update([
            'name' => $request->name,
            'price' => $request->price,
            'category_id' => $request->category_id,
            'description' => $request->description,
            'stock' => $request->stock,
            'status' => $request->status ?? $product->status,
        ]);

        // Handle image upload
        if ($request->hasFile('thumbnail')) {
            $image = $request->file('thumbnail');
            $filename = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('assets/images/products'), $filename);
            $product->thumbnail = $filename;
            $product->save();
        }

        return redirect()->route('celebrity.products.index')
            ->with('success', 'Product updated successfully');
    }

    /**
     * Delete product
     */
    public function destroy($id)
    {
        $userId = Auth::guard('celebrity')->id();
        $product = Product::where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();
        
        $product->delete();

        return redirect()->route('celebrity.products.index')
            ->with('success', 'Product deleted successfully');
    }
}



