<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Spec 5.3: the first photo by sort_order is the cover. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trek_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trek_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['trek_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trek_photos');
    }
};
