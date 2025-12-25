<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Product Chatbot Queries Table
        Schema::create('product_chatbot_queries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id');
            $table->text('question');
            $table->text('answer')->nullable();
            $table->boolean('is_auto_answer')->default(false);
            $table->enum('status', ['pending', 'answered', 'closed'])->default('pending');
            $table->string('language', 10)->default('en');
            $table->unsignedBigInteger('answered_by')->nullable(); // admin user id
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index(['product_id', 'status']);
            $table->index(['user_id', 'product_id']);
        });

        // Product FAQs Table
        Schema::create('product_faqs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id')->nullable(); // null = general FAQ
            $table->string('question');
            $table->text('answer');
            $table->string('language', 10)->default('en');
            $table->integer('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index(['product_id', 'language', 'is_active']);
        });

        // Translations Table
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->text('source_text'); // Original English text
            $table->string('target_language', 10); // 'ar'
            $table->text('translated_text'); // Translated text
            $table->integer('usage_count')->default(0);
            $table->timestamps();

            $table->unique(['source_text', 'target_language']);
            $table->index('target_language');
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_chatbot_queries');
        Schema::dropIfExists('product_faqs');
        Schema::dropIfExists('translations');
    }
};




