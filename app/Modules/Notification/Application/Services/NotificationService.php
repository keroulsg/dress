<?php

declare(strict_types=1);

namespace App\Modules\Notification\Application\Services;

use App\Modules\Notification\Application\DTOs\NotificationEnvelopeDTO;
use App\Modules\Notification\Application\Jobs\NotificationDeliveryJob;
use App\Modules\Notification\Domain\Contracts\NotificationContract;
use Illuminate\Contracts\Bus\Dispatcher;

/**
 * Entry point for enqueuing notifications. Delivery is queued so long-running
 * notification work never blocks the request that triggered it.
 */
class NotificationService implements NotificationContract
{
    public function __construct(
        private readonly Dispatcher $dispatcher,
    ) {}

    public function send(NotificationEnvelopeDTO $envelope): void
    {
        $this->dispatcher->dispatch(new NotificationDeliveryJob(
            $envelope->recipientId,
            $envelope->type,
            $envelope->title,
            $envelope->body,
            $envelope->data,
            $envelope->channel,
        ));
    }

    public function sendBulk(array $recipientIds, string $type, string $title, string $body, array $data = []): void
    {
        foreach ($recipientIds as $recipientId) {
            $this->send(new NotificationEnvelopeDTO(
                recipientId: $recipientId,
                type: $type,
                title: $title,
                body: $body,
                data: $data,
            ));
        }
    }
}
