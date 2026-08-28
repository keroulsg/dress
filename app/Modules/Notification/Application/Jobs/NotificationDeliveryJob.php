<?php

declare(strict_types=1);

namespace App\Modules\Notification\Application\Jobs;

use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Notification\Application\DTOs\NotificationEnvelopeDTO;
use App\Modules\Notification\Application\Mail\NotificationMail;
use App\Modules\Notification\Infrastructure\Repositories\NotificationRepository;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class NotificationDeliveryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $recipientId,
        public readonly string $type,
        public readonly string $title,
        public readonly string $body,
        public readonly array $data = [],
        public readonly string $channel = 'database',
    ) {}

    public function handle(NotificationRepository $repository): void
    {
        $repository->persist(new NotificationEnvelopeDTO(
            recipientId: $this->recipientId,
            type: $this->type,
            title: $this->title,
            body: $this->body,
            data: $this->data,
            channel: $this->channel,
        ));

        if (in_array($this->channel, ['email', 'mail'], true)) {
            $this->deliverByMail();
        }
    }

    private function deliverByMail(): void
    {
        $user = User::query()->find($this->recipientId);

        if ($user === null) {
            return;
        }

        Mail::to($user)->queue(new NotificationMail($this->title, $this->body));
    }
}
