<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\ProductFaq;
use App\Models\Product;
use Illuminate\Http\Request;
use Datatables;
use Validator;
use DB;

class ProductFaqController extends AdminBaseController
{
    /**
     * List product FAQs
     */
    public function index()
    {
        return view('admin.productfaq.index');
    }

    /**
     * Datatables
     */
    public function datatables()
    {
        $datas = ProductFaq::with('product:id,name')
            ->latest('id')
            ->get();

        return Datatables::of($datas)
            ->editColumn('product_id', function (ProductFaq $data) {
                return $data->product ? $data->product->name : 'N/A';
            })
            ->editColumn('question', function (ProductFaq $data) {
                return mb_strlen($data->question) > 50 ? mb_substr($data->question, 0, 50) . '...' : $data->question;
            })
            ->editColumn('answer', function (ProductFaq $data) {
                $answer = strip_tags($data->answer);
                return mb_strlen($answer) > 50 ? mb_substr($answer, 0, 50) . '...' : $answer;
            })
            ->editColumn('status', function (ProductFaq $data) {
                $isActive = $data->is_active ?? $data->status ?? 1;
                $status = $isActive == 1 ? '<span class="badge badge-success">Active</span>' : 
                         '<span class="badge badge-danger">Inactive</span>';
                return $status;
            })
            ->addColumn('action', function (ProductFaq $data) {
                return '<div class="action-list">
                    <a href="' . route('admin-product-faq-edit', $data->id) . '" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <a href="javascript:;" data-href="' . route('admin-product-faq-delete', $data->id) . '" 
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
        $products = Product::where('status', 1)->select('id', 'name')->get();
        return view('admin.productfaq.create', compact('products'));
    }

    /**
     * Store product FAQ
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'question' => 'required|string|max:500',
            'answer' => 'required|string|max:2000',
            'status' => 'nullable|in:0,1',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        ProductFaq::create([
            'product_id' => $request->product_id,
            'question' => $request->question,
            'answer' => $request->answer,
            'is_active' => $request->status ?? 1,
        ]);

        return redirect()->route('admin-product-faq-index')
            ->with('success', 'Product FAQ created successfully');
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $faq = ProductFaq::findOrFail($id);
        $products = Product::where('status', 1)->select('id', 'name')->get();
        return view('admin.productfaq.edit', compact('faq', 'products'));
    }

    /**
     * Update product FAQ
     */
    public function update(Request $request, $id)
    {
        $faq = ProductFaq::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'question' => 'required|string|max:500',
            'answer' => 'required|string|max:2000',
            'status' => 'nullable|in:0,1',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $faq->update([
            'product_id' => $request->product_id,
            'question' => $request->question,
            'answer' => $request->answer,
            'is_active' => $request->status ?? ($faq->is_active ?? 1),
        ]);

        return redirect()->route('admin-product-faq-index')
            ->with('success', 'Product FAQ updated successfully');
    }

    /**
     * Delete product FAQ
     */
    public function destroy($id)
    {
        $faq = ProductFaq::findOrFail($id);
        $faq->delete();

        return redirect()->route('admin-product-faq-index')
            ->with('success', 'Product FAQ deleted successfully');
    }
}

