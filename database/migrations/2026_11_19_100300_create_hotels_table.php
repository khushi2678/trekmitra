<?php

use App\Enums\HotelType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Spec 5.5: hotels are never booked on their own, only through a package. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('base_village')->index();
            $table->enum('type', array_column(HotelType::cases(), 'value'));
            $table->unsignedInteger('price_per_night'); // paise, informational only
            $table->text('description');
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
