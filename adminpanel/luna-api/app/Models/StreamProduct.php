<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StreamProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'stream_id',
        'product_id',
        'display_order',
        'is_featured',
        'added_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'added_at' => 'datetime',
    ];

    /**
     * Get the stream that owns this product
     */
    public function stream()
    {
        return $this->belongsTo(LiveStream::class);
    }

    /**
     * Get the product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}



