<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Entities;

use App\Modules\Payment\Infrastructure\Database\Factories\PaymentWebhookEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentWebhookEvent extends Model
{
    /** @use HasFactory<PaymentWebhookEventFactory> */
    use HasFactory;

    protected $fillable = [
        'gateway_event_id',
        'gateway',
        'event_type',
        'payload_json',
        'status',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload_json' => 'array',
            'processed_at' => 'datetime',
        ];
    }

    protected static function newFactory(): PaymentWebhookEventFactory
    {
        return PaymentWebhookEventFactory::new();
    }
}
