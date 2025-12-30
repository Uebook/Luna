<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stream_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('live_streams')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('display_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('added_at')->useCurrent();
            $table->timestamps();

            $table->unique(['stream_id', 'product_id']);
            $table->index('stream_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stream_products');
    }
};



