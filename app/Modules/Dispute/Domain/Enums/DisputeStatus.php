<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Domain\Enums;

enum DisputeStatus: string
{
    case Open = 'open';
    case UnderReview = 'under_review';
    case AwaitingCustomer = 'awaiting_customer';
    case AwaitingAtelier = 'awaiting_atelier';
    case Resolved = 'resolved';
    case Rejected = 'rejected';
}
