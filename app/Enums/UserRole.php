<?php

namespace App\Enums;

/**
 * A user has exactly one role (spec Section 4).
 * Admin accounts are created by the seeder only, never through registration.
 */
enum UserRole: string
{
    case Trekker = 'trekker';
    case Guide = 'guide';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Trekker => 'Trekker',
            self::Guide => 'Guide',
            self::Admin => 'Admin',
        };
    }

    /** Roles someone may choose on the public register page. */
    public static function registerable(): array
    {
        return [self::Trekker, self::Guide];
    }
}
