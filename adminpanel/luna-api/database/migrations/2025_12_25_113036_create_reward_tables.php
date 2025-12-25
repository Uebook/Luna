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
        // Add reward_points column to users table if it doesn't exist
        if (!Schema::hasColumn('users', 'reward_points')) {
            Schema::table('users', function (Blueprint $table) {
                $table->integer('reward_points')->default(0)->after('email');
            });
        }

        // Create gift_codes table
        Schema::create('gift_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->foreignId('from_user_id')->constrained('users')->onDelete('cascade');
            $table->string('to_email')->nullable();
            $table->string('to_phone')->nullable();
            $table->foreignId('to_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('points');
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'redeemed', 'expired'])->default('pending');
            $table->timestamp('expires_at');
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();

            $table->index('code');
            $table->index('from_user_id');
            $table->index('to_user_id');
            $table->index('status');
        });

        // Create reward_transactions table
        Schema::create('reward_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['purchase', 'gift_sent', 'gift_received', 'redeem_code', 'admin_adjustment'])->default('purchase');
            $table->integer('points'); // positive for credits, negative for debits
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $table->foreignId('gift_code_id')->nullable()->constrained('gift_codes')->onDelete('set null');
            $table->text('description')->nullable();
            $table->decimal('amount_bhd', 10, 3)->nullable(); // For purchase transactions
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index('order_id');
            $table->index('gift_code_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reward_transactions');
        Schema::dropIfExists('gift_codes');
        
        if (Schema::hasColumn('users', 'reward_points')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('reward_points');
            });
        }
    }
};
