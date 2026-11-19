<?php

namespace App\Enums;

/** Kind of stay at the base village (spec 5.5). */
enum HotelType: string
{
    case Hotel = 'hotel';
    case Homestay = 'homestay';
    case Camp = 'camp';

    public function label(): string
    {
        return match ($this) {
            self::Hotel => 'Hotel',
            self::Homestay => 'Homestay',
            self::Camp => 'Camp',
        };
    }
}
