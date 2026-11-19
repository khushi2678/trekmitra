<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\JoiningPoint;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Spec 5.10. Amounts come from PricingService only, never from the browser,
 * so they are fillable here but must only be set by server code.
 */
#[Fillable([
    'user_id', 'group_id', 'package_id', 'seats', 'joining_point',
    'transport_added', 'level_warning_accepted', 'health_note',
    'package_amount', 'transport_amount', 'guide_amount', 'total_amount',
    'status', 'hold_expires_at', 'confirmed_at', 'cancelled_at',
])]
class Booking extends Model
{
    protected function casts(): array
    {
        return [
            'joining_point' => JoiningPoint::class,
            'status' => BookingStatus::class,
            'transport_added' => 'boolean',
            'level_warning_accepted' => 'boolean',
            'package_amount' => 'integer',
            'transport_amount' => 'integer',
            'guide_amount' => 'integer',
            'total_amount' => 'integer',
            'hold_expires_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /** Give every new booking its code, e.g. TM-2026-000123, from its id. */
    protected static function booted(): void
    {
        static::created(function (Booking $booking) {
            $booking->code = sprintf('TM-%s-%06d', $booking->created_at->format('Y'), $booking->id);
            $booking->saveQuietly();
        });
    }

    /** Find bookings by code in URLs: /bookings/TM-2026-000123 */
    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
