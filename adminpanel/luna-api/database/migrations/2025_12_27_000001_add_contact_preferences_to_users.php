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
        Schema::table('users', function (Blueprint $table) {
            // Notification preferences (all enabled by default)
            $table->boolean('notif_new_msg')->default(true)->after('language');
            $table->boolean('email_promo')->default(true)->after('notif_new_msg');
            $table->boolean('sms_promo')->default(true)->after('email_promo');
            $table->boolean('wa_promo')->default(true)->after('sms_promo');
            
            // Contact details for promotions (nullable, can be different from main email/phone)
            $table->string('promo_email')->nullable()->after('wa_promo');
            $table->string('sms_phone')->nullable()->after('promo_email');
            $table->string('wa_phone')->nullable()->after('sms_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'notif_new_msg',
                'email_promo',
                'sms_promo',
                'wa_promo',
                'promo_email',
                'sms_phone',
                'wa_phone',
            ]);
        });
    }
};

