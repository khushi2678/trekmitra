<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Spec 5.11: one row per Razorpay order. */
#[Fillable([
    'booking_id', 'razorpay_order_id', 'razorpay_payment_id',
    'razorpay_signature', 'amount', 'status', 'paid_at',
])]
#[Hidden(['razorpay_signature'])]
class Payment extends Model
{
    protected function casts(): array
    {
        return [
            'status' => PaymentStatus::class,
            'amount' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
