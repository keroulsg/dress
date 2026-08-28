<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Entities;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Domain\Entities\AtelierStaff;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Dispute\Domain\Entities\Dispute;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\Inspection\Domain\Entities\InspectionReport;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\Payment\Domain\Entities\Transaction;
use App\Modules\Review\Domain\Entities\Review;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'email_verified_at',
        'phone_verified_at',
        'rating_average',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'rating_average' => 'decimal:2',
        ];
    }

    public function ateliers(): HasMany
    {
        return $this->hasMany(Atelier::class, 'owner_user_id');
    }

    public function staffMemberships(): HasMany
    {
        return $this->hasMany(AtelierStaff::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'renter_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function kycs(): HasMany
    {
        return $this->hasMany(KycVerification::class);
    }

    public function activeKyc(): HasOne
    {
        return $this->hasOne(KycVerification::class)->latestOfMany();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'renter_id');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'opened_by');
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(InspectionReport::class, 'inspector_id');
    }

    public function isSuperadmin(): bool
    {
        return $this->role === 'superadmin';
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }
}
