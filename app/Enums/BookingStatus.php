<?php

namespace App\Enums;

/** Spec 5.10. */
enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
    case Completed = 'completed';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /** Pending, confirmed and completed bookings hold seats; cancelled and expired don't. */
    public function holdsSeats(): bool
    {
        return ! in_array($this, [self::Cancelled, self::Expired], true);
    }
}
