<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Entities;

use App\Modules\Finance\Domain\Enums\LedgerAccountType;
use App\Modules\Finance\Infrastructure\Database\Factories\LedgerAccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LedgerAccount extends Model
{
    /** @use HasFactory<LedgerAccountFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'currency',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => LedgerAccountType::class,
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function entries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class);
    }

    public function isDebitSide(): bool
    {
        return in_array($this->type, [
            LedgerAccountType::Asset,
            LedgerAccountType::Expense,
        ], true);
    }

    protected static function newFactory(): LedgerAccountFactory
    {
        return LedgerAccountFactory::new();
    }
}
