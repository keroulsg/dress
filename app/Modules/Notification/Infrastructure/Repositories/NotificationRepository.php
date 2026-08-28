<?php

declare(strict_types=1);

namespace App\Modules\Notification\Infrastructure\Repositories;

use App\Modules\Notification\Application\DTOs\NotificationEnvelopeDTO;

/**
 * Persistence port for queued notification delivery.
 */
interface NotificationRepository
{
    public function persist(NotificationEnvelopeDTO $envelope): void;
}
