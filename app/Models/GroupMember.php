<?php

namespace App\Models;

use App\Enums\Gender;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Spec 5.9: user_id is set only when the member has an account. */
#[Fillable([
    'group_id', 'booking_id', 'user_id', 'name', 'gender',
    'emergency_contact_name', 'emergency_contact_phone',
])]
class GroupMember extends Model
{
    protected function casts(): array
    {
        return [
            'gender' => Gender::class,
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
