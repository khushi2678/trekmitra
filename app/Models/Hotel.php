<?php

namespace App\Models;

use App\Enums\HotelType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Spec 5.5: never booked on its own, only through a package. */
#[Fillable(['name', 'base_village', 'type', 'price_per_night', 'description', 'photo_path'])]
class Hotel extends Model
{
    protected function casts(): array
    {
        return [
            'type' => HotelType::class,
            'price_per_night' => 'integer',
        ];
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }
}
