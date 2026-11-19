<?php

namespace App\Models;

use App\Enums\GuideStatus;
use App\Enums\Level;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Spec 5.7 */
#[Fillable([
    'user_id', 'bio', 'experience_years', 'languages', 'levels_led',
    'daily_rate', 'status', 'approved_at',
])]
class GuideProfile extends Model
{
    protected function casts(): array
    {
        return [
            'languages' => 'array',
            'levels_led' => AsEnumCollection::of(Level::class),
            'daily_rate' => 'integer',
            'status' => GuideStatus::class,
            'approved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    public function scopeApproved(Builder $query): void
    {
        $query->where('status', GuideStatus::Approved);
    }

    public function canLead(Level $level): bool
    {
        return $this->levels_led->contains($level);
    }
}
