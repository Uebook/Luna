<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StreamProduct extends Model
{
    protected $fillable = [
        'stream_id',
        'product_id',
        'display_order',
        'is_featured',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Get the stream that owns this product
     */
    public function stream()
    {
        return $this->belongsTo(LiveStream::class, 'stream_id');
    }

    /**
     * Get the product details
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}




