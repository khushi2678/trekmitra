<?php

use App\Enums\PaymentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Spec 5.11: one row per Razorpay order. A booking can have several (retries). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->restrictOnDelete();
            $table->string('razorpay_order_id')->unique();
            $table->string('razorpay_payment_id')->nullable()->unique();
            $table->string('razorpay_signature')->nullable();
            $table->unsignedInteger('amount'); // paise
            $table->enum('status', array_column(PaymentStatus::cases(), 'value'))
                ->default(PaymentStatus::Created->value);
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
