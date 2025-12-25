<?php

namespace App\Models;


class Subcategory extends Model
{
    protected $fillable = ['category_id', 'name', 'slug', 'status'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function childcategories()
    {
        return $this->hasMany(Childcategory::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}


