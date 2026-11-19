<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\GroupStatus;
use App\Enums\GroupType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Spec 5.8. Note: "groups" is a reserved word in MySQL 8. Eloquent quotes it
 * for you; only raw SQL needs `groups` in backticks.
 */
#[Fillable([
    'trek_id', 'leader_user_id', 'guide_profile_id', 'type',
    'women_only', 'start_date', 'seat_limit', 'status',
])]
class Group extends Model
{
    protected function casts(): array
    {
        return [
            'type' => GroupType::class,
            'status' => GroupStatus::class,
            'women_only' => 'boolean',
            'start_date' => 'date',
        ];
    }

    public function trek(): BelongsTo
    {
        return $this->belongsTo(Trek::class);
    }

    public function leader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'leader_user_id');
    }

    public function guideProfile(): BelongsTo
    {
        return $this->belongsTo(GuideProfile::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class);
    }

    /** Not stored: start_date + duration_days - 1 (spec 5.8). Needs the trek loaded. */
    public function endDate(): Carbon
    {
        return $this->start_date->copy()->addDays($this->trek->duration_days - 1);
    }

    /** Seats held by pending, confirmed and completed bookings. */
    public function seatsTaken(): int
    {
        return (int) $this->bookings()
            ->whereNotIn('status', [BookingStatus::Cancelled, BookingStatus::Expired])
            ->sum('seats');
    }

    public function seatsLeft(): int
    {
        return max(0, $this->seat_limit - $this->seatsTaken());
    }
}
