<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Enums;

enum TransactionStatus: string
{
    case Initiated = 'initiated';
    case Authorized = 'authorized';
    case Captured = 'captured';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';
    case Voided = 'voided';
    case Failed = 'failed';
}
