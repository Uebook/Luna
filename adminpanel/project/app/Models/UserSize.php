<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSize extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'chest',
        'waist',
        'hips',
        'shoulder',
        'arm_length',
        'leg_length',
        'neck',
        'bicep',
        'thigh',
        'shirt_size',
        'pant_size',
        'shoe_size',
        'notes'
    ];

    public function user()
    {
        return $this->belongsTo('App\Models\User')->withDefault();
    }
}
