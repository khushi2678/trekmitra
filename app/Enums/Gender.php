<?php

namespace App\Enums;

/**
 * Gender options (spec 5.1). Used for women-only open groups (R6)
 * and the male / female / other counts shown on groups (R9).
 */
enum Gender: string
{
    case Male = 'male';
    case Female = 'female';
    case Other = 'other';
    case PreferNotToSay = 'prefer_not_to_say';

    public function label(): string
    {
        return match ($this) {
            self::Male => 'Male',
            self::Female => 'Female',
            self::Other => 'Other',
            self::PreferNotToSay => 'Prefer not to say',
        };
    }
}
