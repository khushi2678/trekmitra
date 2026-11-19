<?php

namespace App\Enums;

/** Guide approval status (spec 5.7). Only approved guides can be picked for a group. */
enum GuideStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
