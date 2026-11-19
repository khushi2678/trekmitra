<?php

namespace App\Enums;

/**
 * Trek, trekker and guide level (spec glossary and rule R1):
 * beginner < intermediate < expert.
 */
enum Level: string
{
    case Beginner = 'beginner';
    case Intermediate = 'intermediate';
    case Expert = 'expert';

    public function label(): string
    {
        return match ($this) {
            self::Beginner => 'Beginner',
            self::Intermediate => 'Intermediate',
            self::Expert => 'Expert',
        };
    }

    /** Position in the order beginner (1) < intermediate (2) < expert (3). */
    public function rank(): int
    {
        return match ($this) {
            self::Beginner => 1,
            self::Intermediate => 2,
            self::Expert => 3,
        };
    }

    /** True when this level is harder than $other (used for the R2 level warning). */
    public function isAbove(self $other): bool
    {
        return $this->rank() > $other->rank();
    }
}
