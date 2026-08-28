<?php

declare(strict_types=1);

namespace App\Modules\KYC\Domain\Entities;

use App\Modules\Identity\Domain\Entities\User;
use App\Modules\KYC\Domain\Enums\KycStatus;
use App\Modules\KYC\Infrastructure\Database\Factories\KycVerificationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycVerification extends Model
{
    /** @use HasFactory<KycVerificationFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'document_type',
        'front_path',
        'back_path',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => KycStatus::class,
            'reviewed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isApproved(): bool
    {
        return $this->status === KycStatus::Approved;
    }

    protected static function newFactory(): KycVerificationFactory
    {
        return KycVerificationFactory::new();
    }
}
