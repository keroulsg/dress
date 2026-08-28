<?php

declare(strict_types=1);

namespace App\Modules\Notification\Domain\Contracts;

use App\Modules\Notification\Application\DTOs\NotificationEnvelopeDTO;

/**
 * Public contract for the Notification module.
 *
 * All modules enqueue notifications through this contract. Delivery is queued
 * so long-running notification work never blocks the request that triggered it.
 */
interface NotificationContract
{
    public function send(NotificationEnvelopeDTO $envelope): void;

    /**
     * @param  list<int>  $recipientIds
     */
    public function sendBulk(array $recipientIds, string $type, string $title, string $body, array $data = []): void;
}
