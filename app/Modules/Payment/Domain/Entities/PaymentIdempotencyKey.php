<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Entities;

use App\Modules\Payment\Infrastructure\Database\Factories\PaymentIdempotencyKeyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentIdempotencyKey extends Model
{
    /** @use HasFactory<PaymentIdempotencyKeyFactory> */
    use HasFactory;

    protected $fillable = [
        'idempotency_key',
        'operation',
        'transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'transaction_id' => 'integer',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    protected static function newFactory(): PaymentIdempotencyKeyFactory
    {
        return PaymentIdempotencyKeyFactory::new();
    }
}
