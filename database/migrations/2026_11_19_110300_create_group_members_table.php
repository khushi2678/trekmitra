<?php

use App\Enums\Gender;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Spec 5.9: one row per person on the trek, whether registered or not. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->restrictOnDelete();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->enum('gender', array_column(Gender::cases(), 'value'));
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone', 15);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_members');
    }
};
