<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Entities;

use App\Modules\Finance\Infrastructure\Database\Factories\LedgerEntryFactory;
use App\Modules\Payment\Domain\Entities\Transaction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEntry extends Model
{
    /** @use HasFactory<LedgerEntryFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'transaction_id',
        'account_id',
        'debit',
        'credit',
        'description',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'debit' => 'decimal:2',
            'credit' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class);
    }

    public function isDebit(): bool
    {
        return $this->debit > 0;
    }

    protected static function newFactory(): LedgerEntryFactory
    {
        return LedgerEntryFactory::new();
    }
}
