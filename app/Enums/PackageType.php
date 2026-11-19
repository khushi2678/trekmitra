<?php

namespace App\Enums;

/**
 * The three package types a trek can offer (spec 5.6).
 * Each trek has at most one package of each type.
 */
enum PackageType: string
{
    case TrekOnly = 'trek_only';
    case TrekStay = 'trek_stay';
    case AllInclusive = 'all_inclusive';

    public function label(): string
    {
        return match ($this) {
            self::TrekOnly => 'Trek only',
            self::TrekStay => 'Trek + stay',
            self::AllInclusive => 'All inclusive',
        };
    }

    /** Trek + stay and all inclusive need a hotel and at least one night. */
    public function needsHotel(): bool
    {
        return $this !== self::TrekOnly;
    }

    /** All inclusive packages already include meet-up transport (spec 6). */
    public function includesTransport(): bool
    {
        return $this === self::AllInclusive;
    }
}
