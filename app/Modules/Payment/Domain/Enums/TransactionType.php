<?php

declare(strict_types=1);

namespace App\Modules\Payment\Domain\Enums;

enum TransactionType: string
{
    case RentalPayment = 'rental_payment';
    case DepositAuthorization = 'deposit_authorization';
    case DepositCapture = 'deposit_capture';
    case DepositRelease = 'deposit_release';
    case DepositPenalty = 'deposit_penalty';
    case CustomerRefund = 'customer_refund';
    case AtelierPayout = 'atelier_payout';
    case PlatformCommission = 'platform_commission';
    case Tax = 'tax';
    case Adjustment = 'adjustment';
}
