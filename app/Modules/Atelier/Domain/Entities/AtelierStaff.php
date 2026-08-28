<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Domain\Entities;

use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierStaffFactory;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AtelierStaff extends Model
{
    /** @use HasFactory<AtelierStaffFactory> */
    use HasFactory;

    protected $fillable = [
        'atelier_id',
        'user_id',
        'role',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'role' => 'string',
            'is_active' => 'boolean',
        ];
    }

    public function atelier(): BelongsTo
    {
        return $this->belongsTo(Atelier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function newFactory(): AtelierStaffFactory
    {
        return AtelierStaffFactory::new();
    }
}
