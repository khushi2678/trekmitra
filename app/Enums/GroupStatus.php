<?php

namespace App\Enums;

/** Spec 5.8. */
enum GroupStatus: string
{
    case Forming = 'forming';
    case Full = 'full';
    case Cancelled = 'cancelled';
    case Completed = 'completed';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
