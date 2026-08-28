<?php

declare(strict_types=1);

namespace App\Modules\Notification\Infrastructure\Repositories;

use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Notification\Application\DTOs\NotificationEnvelopeDTO;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

class EloquentNotificationRepository implements NotificationRepository
{
    public function __construct(
        private readonly DatabaseNotification $notification,
    ) {}

    public function persist(NotificationEnvelopeDTO $envelope): void
    {
        $this->notification->newQuery()->create([
            'id' => (string) Str::uuid(),
            'type' => $envelope->type,
            'notifiable_type' => (new User)->getMorphClass(),
            'notifiable_id' => $envelope->recipientId,
            'data' => [
                'title' => $envelope->title,
                'body' => $envelope->body,
            ] + $envelope->data,
        ]);
    }
}
