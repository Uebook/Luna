<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
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
                return 'BHD ' . number_format($data->price, 3) . ' / BHD ' . number_format($data->value, 3);
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

    /**
     * Show gift card purchase history (sent)
     */
    public function historySent(Request $request)
    {
        return view('admin.giftcard.history-sent');
    }

    /**
     * Datatables for sent gift cards
     */
    public function datatablesSent()
    {
        $datas = DB::table('gift_card_purchases')
            ->leftJoin('users as sender', 'gift_card_purchases.user_id', '=', 'sender.id')
            ->leftJoin('gift_cards', 'gift_card_purchases.gift_card_id', '=', 'gift_cards.id')
            ->select(
                'gift_card_purchases.*',
                'sender.name as sender_name',
                'sender.email as sender_email',
                'sender.phone as sender_phone',
                'gift_cards.title as gift_card_title',
                'gift_cards.image as gift_card_image'
            )
            ->orderBy('gift_card_purchases.created_at', 'desc')
            ->get();

        return Datatables::of($datas)
            ->addColumn('sender_info', function($data) {
                $info = '<strong>' . ($data->sender_name ?? 'N/A') . '</strong><br>';
                $info .= '<small>' . ($data->sender_email ?? '') . '</small><br>';
                $info .= '<small>' . ($data->sender_phone ?? '') . '</small>';
                return $info;
            })
            ->addColumn('recipient_info', function($data) {
                $info = '<strong>' . ($data->recipient_name ?? 'Self') . '</strong><br>';
                if (isset($data->recipient_email) && $data->recipient_email) {
                    $info .= '<small>' . $data->recipient_email . '</small><br>';
                }
                if (isset($data->recipient_phone) && $data->recipient_phone) {
                    $info .= '<small>' . $data->recipient_phone . '</small>';
                }
                return $info;
            })
            ->addColumn('gift_card_info', function($data) {
                $image = $data->gift_card_image 
                    ? asset('assets/images/giftcards/' . $data->gift_card_image) 
                    : asset('assets/images/noimage.png');
                $info = '<img src="' . $image . '" alt="Gift Card" width="50" height="50" style="object-fit: cover; border-radius: 4px; margin-right: 10px; display: inline-block; vertical-align: middle;">';
                $info .= '<span style="vertical-align: middle;">' . ($data->gift_card_title ?? 'N/A') . '</span>';
                return $info;
            })
            ->addColumn('value', function($data) {
                return 'BHD ' . number_format($data->value, 3);
            })
            ->addColumn('remaining_value', function($data) {
                return 'BHD ' . number_format($data->remaining_value, 3);
            })
            ->addColumn('status', function($data) {
                $statusClass = 'badge-secondary';
                $statusText = ucfirst($data->status ?? 'active');
                
                if ($data->status == 'used') {
                    $statusClass = 'badge-success';
                } elseif ($data->status == 'expired') {
                    $statusClass = 'badge-danger';
                } elseif ($data->status == 'active') {
                    $statusClass = 'badge-info';
                }
                
                return '<span class="badge ' . $statusClass . '">' . $statusText . '</span>';
            })
            ->addColumn('dates', function($data) {
                $dates = '<strong>Purchased:</strong> ' . date('Y-m-d H:i', strtotime($data->created_at)) . '<br>';
                if (isset($data->expires_at) && $data->expires_at) {
                    $dates .= '<strong>Expires:</strong> ' . date('Y-m-d H:i', strtotime($data->expires_at)) . '<br>';
                }
                if (isset($data->redeemed_at) && $data->redeemed_at) {
                    $dates .= '<strong>Redeemed:</strong> ' . date('Y-m-d H:i', strtotime($data->redeemed_at));
                }
                return $dates;
            })
            ->addColumn('action', function($data) {
                $actions = '<div class="action-list">';
                $actions .= '<a href="' . route('admin-giftcard-history-details', $data->id) . '" class="btn btn-info btn-sm">View Details</a>';
                $actions .= '</div>';
                return $actions;
            })
            ->rawColumns(['sender_info', 'recipient_info', 'gift_card_info', 'status', 'dates', 'action'])
            ->toJson();
    }

    /**
     * Show gift card received history (redeemed)
     */
    public function historyReceived(Request $request)
    {
        return view('admin.giftcard.history-received');
    }

    /**
     * Datatables for received/redeemed gift cards
     */
    public function datatablesReceived()
    {
        // Check if redeemed_by_user_id column exists
        $hasRedeemedByColumn = Schema::hasColumn('gift_card_purchases', 'redeemed_by_user_id');
        
        $query = DB::table('gift_card_purchases')
            ->leftJoin('users as sender', 'gift_card_purchases.user_id', '=', 'sender.id')
            ->leftJoin('gift_cards', 'gift_card_purchases.gift_card_id', '=', 'gift_cards.id');
        
        if ($hasRedeemedByColumn) {
            $query->leftJoin('users as receiver', 'gift_card_purchases.redeemed_by_user_id', '=', 'receiver.id')
                  ->where('gift_card_purchases.status', 'used')
                  ->whereNotNull('gift_card_purchases.redeemed_by_user_id');
        } else {
            // Fallback: show all used gift cards
            $query->where('gift_card_purchases.status', 'used')
                  ->where('gift_card_purchases.remaining_value', '<=', 0);
        }
        
        $selects = [
            'gift_card_purchases.*',
            'sender.name as sender_name',
            'sender.email as sender_email',
            'gift_cards.title as gift_card_title',
            'gift_cards.image as gift_card_image'
        ];
        
        if ($hasRedeemedByColumn) {
            $selects = array_merge($selects, [
                'receiver.name as receiver_name',
                'receiver.email as receiver_email',
                'receiver.phone as receiver_phone'
            ]);
        }
        
        $orderBy = $hasRedeemedByColumn && Schema::hasColumn('gift_card_purchases', 'redeemed_at') 
            ? 'gift_card_purchases.redeemed_at' 
            : 'gift_card_purchases.created_at';
        
        $datas = $query->select($selects)
            ->orderBy($orderBy, 'desc')
            ->get();

        return Datatables::of($datas)
            ->addColumn('sender_info', function($data) {
                $info = '<strong>' . ($data->sender_name ?? 'N/A') . '</strong><br>';
                $info .= '<small>' . ($data->sender_email ?? '') . '</small>';
                return $info;
            })
            ->addColumn('receiver_info', function($data) {
                $info = '<strong>' . (isset($data->receiver_name) ? $data->receiver_name : 'N/A') . '</strong><br>';
                if (isset($data->receiver_email) && $data->receiver_email) {
                    $info .= '<small>' . $data->receiver_email . '</small><br>';
                }
                if (isset($data->receiver_phone) && $data->receiver_phone) {
                    $info .= '<small>' . $data->receiver_phone . '</small>';
                }
                return $info;
            })
            ->addColumn('gift_card_info', function($data) {
                $image = $data->gift_card_image 
                    ? asset('assets/images/giftcards/' . $data->gift_card_image) 
                    : asset('assets/images/noimage.png');
                $info = '<img src="' . $image . '" alt="Gift Card" width="50" height="50" style="object-fit: cover; border-radius: 4px; margin-right: 10px; display: inline-block; vertical-align: middle;">';
                $info .= '<span style="vertical-align: middle;">' . ($data->gift_card_title ?? 'N/A') . '</span>';
                return $info;
            })
            ->addColumn('value', function($data) {
                return 'BHD ' . number_format($data->value, 3);
            })
            ->addColumn('dates', function($data) {
                $dates = '<strong>Purchased:</strong> ' . date('Y-m-d H:i', strtotime($data->created_at)) . '<br>';
                if (isset($data->redeemed_at) && $data->redeemed_at) {
                    $dates .= '<strong>Redeemed:</strong> ' . date('Y-m-d H:i', strtotime($data->redeemed_at));
                }
                return $dates;
            })
            ->addColumn('action', function($data) {
                $actions = '<div class="action-list">';
                $actions .= '<a href="' . route('admin-giftcard-history-details', $data->id) . '" class="btn btn-info btn-sm">View Details</a>';
                $actions .= '</div>';
                return $actions;
            })
            ->rawColumns(['sender_info', 'receiver_info', 'gift_card_info', 'dates', 'action'])
            ->toJson();
    }

    /**
     * Show gift card details
     */
    public function historyDetails($id)
    {
        $hasRedeemedByColumn = Schema::hasColumn('gift_card_purchases', 'redeemed_by_user_id');
        
        $query = DB::table('gift_card_purchases')
            ->leftJoin('users as sender', 'gift_card_purchases.user_id', '=', 'sender.id')
            ->leftJoin('gift_cards', 'gift_card_purchases.gift_card_id', '=', 'gift_cards.id')
            ->where('gift_card_purchases.id', $id);
        
        if ($hasRedeemedByColumn) {
            $query->leftJoin('users as receiver', 'gift_card_purchases.redeemed_by_user_id', '=', 'receiver.id');
        }
        
        $selects = [
            'gift_card_purchases.*',
            'sender.name as sender_name',
            'sender.email as sender_email',
            'sender.phone as sender_phone',
            'gift_cards.title as gift_card_title',
            'gift_cards.image as gift_card_image',
            'gift_cards.description as gift_card_description'
        ];
        
        if ($hasRedeemedByColumn) {
            $selects = array_merge($selects, [
                'receiver.name as receiver_name',
                'receiver.email as receiver_email',
                'receiver.phone as receiver_phone'
            ]);
        }
        
        $purchase = $query->select($selects)->first();

        if (!$purchase) {
            return redirect()->route('admin-giftcard-history-sent')
                ->with('error', 'Gift card purchase not found');
        }

        return view('admin.giftcard.history-details', compact('purchase'));
    }
}



