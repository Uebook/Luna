<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LiveStream extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'channel_name',
        'title',
        'description',
        'status',
        'viewer_count',
        'likes_count',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'viewer_count' => 'integer',
        'likes_count' => 'integer',
    ];

    /**
     * Get the user that owns the stream
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get products associated with this stream
     */
    public function products()
    {
        return $this->hasMany(StreamProduct::class)->orderBy('display_order')->orderBy('is_featured', 'desc');
    }

    /**
     * Get products with product details
     */
    public function productsWithDetails()
    {
        return $this->hasMany(StreamProduct::class)
            ->with('product')
            ->orderBy('display_order')
            ->orderBy('is_featured', 'desc');
    }
}

