<?php

namespace App\Models;

use App\Enums\Gender;
use App\Enums\Level;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property string|null $phone
 * @property Gender|null $gender
 * @property Level|null $trek_level
 * @property string|null $emergency_contact_name
 * @property string|null $emergency_contact_phone
 * @property bool $is_blocked
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'email',
    'password',
    'role',
    'phone',
    'gender',
    'trek_level',
    'emergency_contact_name',
    'emergency_contact_phone',
    'is_blocked',
])]
#[Hidden([
    'password',
    'remember_token',
])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_blocked' => 'boolean',
            'role' => UserRole::class,
            'gender' => Gender::class,
            'trek_level' => Level::class,
        ];
    }

    /** Guides only (spec 5.12). */
    public function guideProfile(): HasOne
    {
        return $this->hasOne(GuideProfile::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /** Groups this user created and leads. */
    public function ledGroups(): HasMany
    {
        return $this->hasMany(Group::class, 'leader_user_id');
    }

    public function isTrekker(): bool
    {
        return $this->role === UserRole::Trekker;
    }

    public function isGuide(): bool
    {
        return $this->role === UserRole::Guide;
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /**
     * R27: a trekker needs phone, gender, trek level and an emergency contact
     * before booking.
     */
    public function hasBookingDetails(): bool
    {
        return filled($this->phone)
            && $this->gender !== null
            && $this->trek_level !== null
            && filled($this->emergency_contact_name)
            && filled($this->emergency_contact_phone);
    }
}
