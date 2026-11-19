<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Spec 5.4: exactly one meet-up point per trek. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetup_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trek_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('city');
            $table->string('landmark');
            $table->time('reporting_time');
            $table->string('transport_mode');
            $table->unsignedInteger('transport_price'); // paise, per person, round trip
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetup_points');
    }
};
