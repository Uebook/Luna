<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Datatables;
use Validator;

class CelebrityController extends AdminBaseController
{
    /**
     * List celebrities
     */
    public function index()
    {
        return view('admin.celebrity.index');
    }

    /**
     * Datatables
     */
    public function datatables()
    {
        $datas = User::where('is_provider', 1)
            ->latest('id')
            ->get();

        return Datatables::of($datas)
            ->editColumn('name', function (User $data) {
                return $data->name;
            })
            ->editColumn('email', function (User $data) {
                return $data->email;
            })
            ->editColumn('phone', function (User $data) {
                return $data->phone ?? 'N/A';
            })
            ->editColumn('status', function (User $data) {
                $status = $data->status == 1 ? '<span class="badge badge-success">Active</span>' : 
                         '<span class="badge badge-danger">Inactive</span>';
                return $status;
            })
            ->addColumn('products_count', function (User $data) {
                return \App\Models\Product::where('user_id', $data->id)->count();
            })
            ->addColumn('action', function (User $data) {
                return '<div class="action-list">
                    <a href="' . route('admin-celebrity-show', $data->id) . '" class="btn btn-info btn-sm">
                        <i class="fas fa-eye"></i> View
                    </a>
                    <a href="' . route('admin-celebrity-edit', $data->id) . '" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <a href="javascript:;" data-href="' . route('admin-celebrity-delete', $data->id) . '" 
                       data-toggle="modal" data-target="#confirm-delete" class="btn btn-danger btn-sm delete">
                        <i class="fas fa-trash"></i> Delete
                    </a>
                </div>';
            })
            ->rawColumns(['status', 'action'])
            ->toJson();
    }

    /**
     * Show create form
     */
    public function create()
    {
        return view('admin.celebrity.create');
    }

    /**
     * Store celebrity
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'status' => 'nullable|in:0,1',
        ]);

        if ($validator->fails()) {
            if($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'is_provider' => 1,
                'status' => $request->status ?? 1,
                'email_verified' => 1,
            ]);

            $msg = 'Celebrity created successfully.';
            if($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true, 
                    'message' => $msg, 
                    'redirect' => route('admin-celebrity-index')
                ]);
            }
            return redirect()->route('admin-celebrity-index')
                ->with('success', $msg);
        } catch (\Exception $e) {
            if($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error creating celebrity: ' . $e->getMessage()
                ], 500);
            }
            return back()->with('error', 'Error creating celebrity: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show celebrity details
     */
    public function show($id)
    {
        $celebrity = User::where('id', $id)
            ->where('is_provider', 1)
            ->firstOrFail();

        $products = \App\Models\Product::where('user_id', $id)->latest()->get();
        
        // Calculate total sales with error handling
        $totalSales = 0;
        try {
            // Use vendor_orders table (standard in this system)
            $result = \DB::table('vendor_orders')
                ->join('orders', 'vendor_orders.order_id', '=', 'orders.id')
                ->where('vendor_orders.user_id', $id)
                ->where('orders.payment_status', 'paid')
                ->select(\DB::raw('COALESCE(SUM(vendor_orders.price), 0) as total'))
                ->first();
            $totalSales = $result->total ?? 0;
        } catch (\Exception $e) {
            // If query fails, set total sales to 0
            $totalSales = 0;
        }

        return view('admin.celebrity.show', compact('celebrity', 'products', 'totalSales'));
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $celebrity = User::where('id', $id)
            ->where('is_provider', 1)
            ->firstOrFail();

        return view('admin.celebrity.edit', compact('celebrity'));
    }

    /**
     * Update celebrity
     */
    public function update(Request $request, $id)
    {
        $celebrity = User::where('id', $id)
            ->where('is_provider', 1)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'status' => 'nullable|in:0,1',
        ]);

        if ($validator->fails()) {
            if($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'status' => $request->status ?? $celebrity->status,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        try {
            $celebrity->update($data);

            $msg = 'Celebrity updated successfully.';
            if($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true, 
                    'message' => $msg, 
                    'redirect' => route('admin-celebrity-index')
                ]);
            }
            return redirect()->route('admin-celebrity-index')
                ->with('success', $msg);
        } catch (\Exception $e) {
            if($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error updating celebrity: ' . $e->getMessage()
                ], 500);
            }
            return back()->with('error', 'Error updating celebrity: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Delete celebrity
     */
    public function destroy($id)
    {
        $celebrity = User::where('id', $id)
            ->where('is_provider', 1)
            ->firstOrFail();

        // Check if celebrity has products
        $productsCount = \App\Models\Product::where('user_id', $id)->count();
        if ($productsCount > 0) {
            return redirect()->route('admin-celebrity-index')
                ->with('error', 'Cannot delete celebrity with existing products. Please remove products first.');
        }

        $celebrity->delete();

        return redirect()->route('admin-celebrity-index')
            ->with('success', 'Celebrity deleted successfully');
    }
}

