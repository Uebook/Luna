<?php

namespace App\Models;


class Childcategory extends Model
{
    protected $fillable = ['subcategory_id', 'name', 'slug', 'status'];

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }
    public function products()
    {
        return $this->hasMany(Product::class,'childcategory_id');
    }
}


