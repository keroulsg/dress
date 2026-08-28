<?php

declare(strict_types=1);

namespace App\Modules\Finance\Domain\Enums;

enum LedgerAccountType: string
{
    case Asset = 'asset';
    case Liability = 'liability';
    case Revenue = 'revenue';
    case Expense = 'expense';
}
