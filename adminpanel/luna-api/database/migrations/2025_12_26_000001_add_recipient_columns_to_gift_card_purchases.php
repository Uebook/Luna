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
        Schema::table('gift_card_purchases', function (Blueprint $table) {
            // Add recipient_user_id column if it doesn't exist
            if (!Schema::hasColumn('gift_card_purchases', 'recipient_user_id')) {
                $table->unsignedBigInteger('recipient_user_id')->nullable()->after('user_id');
                $table->foreign('recipient_user_id')->references('id')->on('users')->onDelete('set null');
                $table->index('recipient_user_id');
            }
            
            // Add recipient_phone column if it doesn't exist
            if (!Schema::hasColumn('gift_card_purchases', 'recipient_phone')) {
                $table->string('recipient_phone', 20)->nullable()->after('recipient_email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gift_card_purchases', function (Blueprint $table) {
            if (Schema::hasColumn('gift_card_purchases', 'recipient_user_id')) {
                $table->dropForeign(['recipient_user_id']);
                $table->dropIndex(['recipient_user_id']);
                $table->dropColumn('recipient_user_id');
            }
            
            if (Schema::hasColumn('gift_card_purchases', 'recipient_phone')) {
                $table->dropColumn('recipient_phone');
            }
        });
    }
};

