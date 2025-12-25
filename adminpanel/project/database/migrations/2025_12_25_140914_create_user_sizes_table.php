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
        Schema::create('user_sizes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('name')->nullable()->comment('Name for this size profile (e.g., "My Size", "Summer 2024")');
            $table->decimal('chest', 8, 2)->nullable()->comment('Chest measurement in cm');
            $table->decimal('waist', 8, 2)->nullable()->comment('Waist measurement in cm');
            $table->decimal('hips', 8, 2)->nullable()->comment('Hips measurement in cm');
            $table->decimal('shoulder', 8, 2)->nullable()->comment('Shoulder width in cm');
            $table->decimal('arm_length', 8, 2)->nullable()->comment('Arm length in cm');
            $table->decimal('leg_length', 8, 2)->nullable()->comment('Leg length in cm');
            $table->decimal('neck', 8, 2)->nullable()->comment('Neck circumference in cm');
            $table->decimal('bicep', 8, 2)->nullable()->comment('Bicep circumference in cm');
            $table->decimal('thigh', 8, 2)->nullable()->comment('Thigh circumference in cm');
            $table->string('shirt_size', 10)->nullable()->comment('Shirt size (S, M, L, XL, etc.)');
            $table->string('pant_size', 10)->nullable()->comment('Pant size (28, 30, 32, etc.)');
            $table->string('shoe_size', 10)->nullable()->comment('Shoe size');
            $table->text('notes')->nullable()->comment('Additional notes');
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sizes');
    }
};
