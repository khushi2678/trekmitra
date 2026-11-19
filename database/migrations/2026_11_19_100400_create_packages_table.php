<?php

use App\Enums\PackageType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Spec 5.6. Rules the database can't express (hotel required for
 * trek_stay / all_inclusive, nights >= 1 for those) are enforced in
 * validation and the admin panel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trek_id')->constrained()->cascadeOnDelete();
            $table->enum('type', array_column(PackageType::cases(), 'value'));
            // A hotel used by a package can't be deleted until the package is changed.
            $table->foreignId('hotel_id')->nullable()->constrained()->restrictOnDelete();
            $table->unsignedTinyInteger('nights')->default(0);
            $table->unsignedInteger('price_per_person'); // paise
            $table->json('inclusions');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['trek_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
