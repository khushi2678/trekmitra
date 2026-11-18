
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['trekker', 'guide', 'admin'])
                ->default('trekker');

            $table->string('phone')->nullable();

            $table->enum('gender', [
                'male',
                'female',
                'other',
                'prefer_not_to_say',
            ])->nullable();

            $table->enum('trek_level', [
                'beginner',
                'intermediate',
                'expert',
            ])->nullable();

            $table->string('emergency_contact_name')->nullable();

            $table->string('emergency_contact_phone')->nullable();

            $table->boolean('is_blocked')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'phone',
                'gender',
                'trek_level',
                'emergency_contact_name',
                'emergency_contact_phone',
                'is_blocked',
            ]);
        });
    }
};
