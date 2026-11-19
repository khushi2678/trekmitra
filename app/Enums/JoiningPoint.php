<?php

namespace App\Enums;

/** Where the trekker joins the group (spec 5.10). */
enum JoiningPoint: string
{
    case Meetup = 'meetup';
    case Base = 'base';

    public function label(): string
    {
        return match ($this) {
            self::Meetup => 'Meet-up point',
            self::Base => 'Base village',
        };
    }
}
