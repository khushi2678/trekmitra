<?php

namespace App\Models;

use App\Enums\Level;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** Spec 5.2 */
#[Fillable([
    'name', 'slug', 'state', 'base_village', 'nearest_city', 'level',
    'duration_days', 'distance_km', 'max_altitude_m', 'best_months',
    'short_description', 'description', 'itinerary', 'how_to_reach',
    'map_embed_url', 'nearest_hospital', 'hospital_distance_km',
    'emergency_numbers', 'network_info', 'gear_checklist',
    'is_published', 'is_featured',
])]
class Trek extends Model
{
    protected function casts(): array
    {
        return [
            'level' => Level::class,
            'distance_km' => 'decimal:1',
            'hospital_distance_km' => 'decimal:1',
            'best_months' => 'array',
            'itinerary' => 'array',
            'gear_checklist' => 'array',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    /** URLs use the slug: /treks/kalsubai */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function photos(): HasMany
    {
        return $this->hasMany(TrekPhoto::class)->orderBy('sort_order');
    }

    /** The first photo by sort order (spec 5.3). */
    public function coverPhoto(): HasOne
    {
        return $this->hasOne(TrekPhoto::class)->ofMany('sort_order', 'min');
    }

    public function meetupPoint(): HasOne
    {
        return $this->hasOne(MeetupPoint::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function activePackages(): HasMany
    {
        return $this->packages()->where('is_active', true);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    public function scopeFeatured(Builder $query): void
    {
        $query->where('is_featured', true);
    }

    /** Published, has a meet-up point and at least one active package (spec 5.6). */
    public function scopeBookable(Builder $query): void
    {
        $query->published()->has('meetupPoint')->has('activePackages');
    }

    public function isBookable(): bool
    {
        return $this->is_published
            && $this->meetupPoint()->exists()
            && $this->activePackages()->exists();
    }
}
