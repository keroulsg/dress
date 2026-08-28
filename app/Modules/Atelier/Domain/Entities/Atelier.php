<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Domain\Entities;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Atelier extends Model
{
    /** @use HasFactory<AtelierFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_user_id',
        'business_name',
        'slug',
        'license_number',
        'description',
        'address',
        'city',
        'latitude',
        'longitude',
        'phone',
        'email',
        'commission_rate',
        'is_active',
        'approved_at',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'commission_rate' => 'decimal:2',
            'is_active' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function staff(): HasMany
    {
        return $this->hasMany(AtelierStaff::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function dresses(): HasMany
    {
        return $this->hasMany(Dress::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function isApproved(): bool
    {
        return $this->approved_at !== null;
    }

    public function isActive(): bool
    {
        return (bool) $this->is_active && $this->isApproved();
    }

    public function isOwner(User $user): bool
    {
        return (int) $this->owner_user_id === $user->id;
    }

    public function staffRoleForUser(User $user): ?string
    {
        $role = $this->staff()->where('user_id', $user->id)->value('role');

        return $role === null ? null : (string) $role;
    }

    protected static function newFactory(): AtelierFactory
    {
        return AtelierFactory::new();
    }
}
