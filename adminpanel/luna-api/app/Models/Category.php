<?php

namespace App\Models;



class Category extends Model
{
    protected $fillable = ['name', 'slug', 'status', 'photo', 'image', 'is_featured'];

    public function subcategories()
    {
        return $this->hasMany(Subcategory::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}

