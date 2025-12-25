<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductChatbotQuery extends Model
{
    protected $fillable = [
        'user_id', 'product_id', 'question', 'answer',
        'is_auto_answer', 'status', 'language', 'answered_by', 'answered_at'
    ];

    protected $casts = [
        'is_auto_answer' => 'boolean',
        'answered_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}




