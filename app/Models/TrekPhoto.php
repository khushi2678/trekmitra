<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/** Spec 5.3 */
#[Fillable(['trek_id', 'path', 'sort_order'])]
class TrekPhoto extends Model
{
    public function trek(): BelongsTo
    {
        return $this->belongsTo(Trek::class);
    }

    /** Full URL for the browser. Photos live on the public disk (run php artisan storage:link once). */
    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
