<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Spec 5.4: transport_price is paise per person, round trip. */
#[Fillable(['trek_id', 'city', 'landmark', 'reporting_time', 'transport_mode', 'transport_price'])]
class MeetupPoint extends Model
{
    protected function casts(): array
    {
        return [
            'transport_price' => 'integer',
        ];
    }

    public function trek(): BelongsTo
    {
        return $this->belongsTo(Trek::class);
    }
}
