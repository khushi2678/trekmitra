<?php

use App\Enums\GuideStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Spec 5.7: one profile per guide user. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guide_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->restrictOnDelete();
            $table->text('bio');
            $table->unsignedTinyInteger('experience_years');
            $table->json('languages');
            $table->json('levels_led'); // at least one Level value, checked in validation
            $table->unsignedInteger('daily_rate'); // paise
            $table->enum('status', array_column(GuideStatus::cases(), 'value'))
                ->default(GuideStatus::Pending->value)
                ->index();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_profiles');
    }
};
