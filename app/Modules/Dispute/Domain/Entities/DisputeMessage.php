<?php

namespace App\Modules\Dispute\Domain\Entities;

use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisputeMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'dispute_id',
        'user_id',
        'message',
        'is_admin_note',
        'attachments',
    ];

    protected $casts = [
        'is_admin_note' => 'boolean',
        'attachments' => 'array',
    ];

    /**
     * @return BelongsTo<Dispute, DisputeMessage>
     */
    public function dispute(): BelongsTo
    {
        return $this->belongsTo(Dispute::class);
    }

    /**
     * @return BelongsTo<User, DisputeMessage>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
