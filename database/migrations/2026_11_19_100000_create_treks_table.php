<?php

use App\Enums\Level;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Spec 5.2 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('treks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('state');
            $table->string('base_village');
            $table->string('nearest_city')->index();
            $table->enum('level', array_column(Level::cases(), 'value'))->index();
            $table->unsignedTinyInteger('duration_days');
            $table->decimal('distance_km', 5, 1);
            $table->unsignedInteger('max_altitude_m');
            $table->json('best_months');
            $table->string('short_description', 200);
            $table->text('description');
            $table->json('itinerary');
            $table->text('how_to_reach');
            $table->string('map_embed_url')->nullable();
            $table->string('nearest_hospital');
            $table->decimal('hospital_distance_km', 5, 1);
            $table->text('emergency_numbers');
            $table->text('network_info');
            $table->json('gear_checklist');
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['is_published', 'is_featured']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('treks');
    }
};
