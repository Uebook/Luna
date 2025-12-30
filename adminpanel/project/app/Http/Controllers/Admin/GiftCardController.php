<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Datatables;
use DB;

class GiftCardController extends AdminBaseController
{
    /**
     * List all gift cards
     */
    public function index(Request $request)
    {
        return view('admin.giftcard.index');
    }

    /**
     * Datatables for gift cards list
     */
    public function datatables()
    {
        $datas = DB::table('gift_cards')
            ->orderBy('id', 'desc')
            ->get();

        return Datatables::of($datas)
            ->addColumn('image', function($data) {
                $image = $data->image ? asset('assets/images/giftcards/' . $data->image) : asset('assets/images/noimage.png');
                return '<img src="' . $image . '" alt="Gift Card" width="80" height="80" style="object-fit: cover; border-radius: 8px;">';
            })
            ->addColumn('price_value', function($data) {
                return 'KWD ' . number_format($data->price, 2) . ' / KWD ' . number_format($data->value, 2);
            })
            ->addColumn('status', function($data) {
                return $data->status == 1 
                    ? '<span class="badge badge-success">Active</span>' 
                    : '<span class="badge badge-danger">Inactive</span>';
            })
            ->addColumn('action', function($data) {
                $actions = '<div class="action-list">';
                $actions .= '<a href="' . route('admin-giftcard-edit', $data->id) . '" class="btn btn-primary btn-sm">Edit</a>';
                $actions .= '<a href="javascript:;" data-href="' . route('admin-giftcard-delete', $data->id) . '" data-toggle="modal" data-target="#confirm-delete" class="btn btn-danger btn-sm">Delete</a>';
                $actions .= '</div>';
                return $actions;
            })
            ->rawColumns(['image', 'status', 'action'])
            ->toJson();
    }

    /**
     * Show create form
     */
    public function create()
    {
        return view('admin.giftcard.create');
    }

    /**
     * Store new gift card
     */
    public function store(Request $request)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'value' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'validity_days' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:0,1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()->all()
            ], 422);
        }

        try {
            $data = [
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'value' => $request->value,
                'discount_percentage' => $request->discount_percentage,
                'validity_days' => $request->validity_days,
                'sort_order' => $request->sort_order ?? 0,
                'status' => $request->status,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $name = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('assets/images/giftcards'), $name);
                $data['image'] = $name;
            }

            DB::table('gift_cards')->insert($data);

            return response()->json([
                'success' => true,
                'message' => 'Gift card created successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating gift card: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show edit form
     */
    public function edit($id)
    {
        $giftCard = DB::table('gift_cards')->where('id', $id)->first();
        
        if (!$giftCard) {
            return redirect()->route('admin-giftcard-index')
                ->with('error', 'Gift card not found');
        }

        return view('admin.giftcard.edit', compact('giftCard'));
    }

    /**
     * Update gift card
     */
    public function update(Request $request, $id)
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'value' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'validity_days' => 'nullable|integer|min:1',
            'sort_order' => 'nullable|integer',
            'status' => 'required|in:0,1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()->all()
            ], 422);
        }

        try {
            $giftCard = DB::table('gift_cards')->where('id', $id)->first();
            
            if (!$giftCard) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gift card not found'
                ], 404);
            }

            $data = [
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'value' => $request->value,
                'discount_percentage' => $request->discount_percentage,
                'validity_days' => $request->validity_days,
                'sort_order' => $request->sort_order ?? $giftCard->sort_order ?? 0,
                'status' => $request->status,
                'updated_at' => now(),
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($giftCard->image && file_exists(public_path('assets/images/giftcards/' . $giftCard->image))) {
                    unlink(public_path('assets/images/giftcards/' . $giftCard->image));
                }

                $image = $request->file('image');
                $name = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('assets/images/giftcards'), $name);
                $data['image'] = $name;
            }

            DB::table('gift_cards')->where('id', $id)->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Gift card updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating gift card: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete gift card
     */
    public function destroy($id)
    {
        try {
            $giftCard = DB::table('gift_cards')->where('id', $id)->first();
            
            if (!$giftCard) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gift card not found'
                ], 404);
            }

            // Delete image
            if ($giftCard->image && file_exists(public_path('assets/images/giftcards/' . $giftCard->image))) {
                unlink(public_path('assets/images/giftcards/' . $giftCard->image));
            }

            DB::table('gift_cards')->where('id', $id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Gift card deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting gift card: ' . $e->getMessage()
            ], 500);
        }
    }
}


