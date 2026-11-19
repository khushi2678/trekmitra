<?php

namespace App\Enums;

/** Spec 5.8 and glossary. */
enum GroupType: string
{
    case Private = 'private';
    case Open = 'open';
    case Solo = 'solo';

    public function label(): string
    {
        return match ($this) {
            self::Private => 'Private group',
            self::Open => 'Open group',
            self::Solo => 'Solo',
        };
    }

    /** Guide fee is split between seats only for open groups (spec 6). */
    public function splitsGuideFee(): bool
    {
        return $this === self::Open;
    }
}
