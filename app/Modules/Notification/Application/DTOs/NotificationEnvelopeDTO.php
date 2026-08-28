<?php

declare(strict_types=1);

namespace App\Modules\Notification\Application\DTOs;

/**
 * Immutable notification delivery envelope.
 */
final readonly class NotificationEnvelopeDTO
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public int $recipientId,
        public string $type,
        public string $title,
        public string $body,
        public array $data = [],
        public string $channel = 'database',
    ) {}
}
