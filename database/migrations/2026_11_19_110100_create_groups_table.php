<?php

use App\Enums\GroupStatus;
use App\Enums\GroupType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Spec 5.8. end_date is not stored: start_date + duration_days - 1.
 * Rules checked in code: women_only only for open groups, start_date at
 * least 2 days ahead, seat_limit 1 for solo and 4-15 for open.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trek_id')->constrained()->restrictOnDelete();
            $table->foreignId('leader_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('guide_profile_id')->constrained()->restrictOnDelete();
            $table->enum('type', array_column(GroupType::cases(), 'value'));
            $table->boolean('women_only')->default(false);
            $table->date('start_date');
            $table->unsignedTinyInteger('seat_limit');
            $table->enum('status', array_column(GroupStatus::cases(), 'value'))
                ->default(GroupStatus::Forming->value);
            $table->timestamps();

            // "Open groups for this trek that are still forming" (join page)
            $table->index(['trek_id', 'type', 'status', 'start_date']);
            // Guide availability: is this guide already busy on these dates?
            $table->index(['guide_profile_id', 'start_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
