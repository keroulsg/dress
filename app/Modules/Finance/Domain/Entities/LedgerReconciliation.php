<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Entities;

use App\Modules\Finance\Infrastructure\Database\Factories\LedgerReconciliationFactory;
use App\Modules\Payment\Domain\Entities\Transaction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerReconciliation extends Model
{
    public const UPDATED_AT = null;

    /** @use HasFactory<LedgerReconciliationFactory> */
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'idempotency_key',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    protected static function newFactory(): LedgerReconciliationFactory
    {
        return LedgerReconciliationFactory::new();
    }
}
