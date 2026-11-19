<?php

use App\Enums\BookingStatus;
use App\Enums\JoiningPoint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Spec 5.10. All amounts are paise and calculated by PricingService on the
 * server. "One active booking per user per group" is checked in code,
 * because cancelled and expired bookings don't count.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->unique(); // TM-YYYY-000123, set right after insert from the id
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('group_id')->constrained()->restrictOnDelete();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->unsignedTinyInteger('seats');
            $table->enum('joining_point', array_column(JoiningPoint::cases(), 'value'));
            $table->boolean('transport_added')->default(false);
            $table->boolean('level_warning_accepted')->default(false);
            $table->string('health_note')->nullable();
            $table->unsignedInteger('package_amount');
            $table->unsignedInteger('transport_amount');
            $table->unsignedInteger('guide_amount');
            $table->unsignedInteger('total_amount');
            $table->enum('status', array_column(BookingStatus::cases(), 'value'))
                ->default(BookingStatus::Pending->value);
            $table->timestamp('hold_expires_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'group_id']);
            $table->index(['group_id', 'status']);          // seats taken in a group
            $table->index(['status', 'hold_expires_at']);   // job that expires unpaid holds
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
