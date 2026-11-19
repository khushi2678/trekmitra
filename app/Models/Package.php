<?php

namespace App\Models;

use App\Enums\PackageType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Spec 5.6 */
#[Fillable(['trek_id', 'type', 'hotel_id', 'nights', 'price_per_person', 'inclusions', 'is_active'])]
class Package extends Model
{
    protected function casts(): array
    {
        return [
            'type' => PackageType::class,
            'price_per_person' => 'integer',
            'inclusions' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function trek(): BelongsTo
    {
        return $this->belongsTo(Trek::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
