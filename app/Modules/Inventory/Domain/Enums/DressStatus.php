<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Domain\Enums;

/**
 * Dress lifecycle statuses as stored on the dresses.status column. Only the
 * Inventory state machine may move a dress between these states.
 */
enum DressStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Rented = 'rented';
    case Reserved = 'reserved';
    case Maintenance = 'maintenance';
    case Cleaning = 'cleaning';
    case Alteration = 'alteration';
    case Retired = 'retired';
}
