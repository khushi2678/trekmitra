<?php

namespace App\Enums;

/** Spec 5.11. */
enum PaymentStatus: string
{
    case Created = 'created';
    case Paid = 'paid';
    case Failed = 'failed';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
