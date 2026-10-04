<?php

declare(strict_types=1);

namespace App\Modules\Dispute\Application\Services;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\State\BookingStateMachine;
use App\Modules\Dispute\Application\DTOs\DisputeResolutionDTO;
use App\Modules\Dispute\Domain\Contracts\DisputeContract;
use App\Modules\Dispute\Domain\Entities\Dispute;
use App\Modules\Dispute\Domain\Entities\DisputeMessage;
use App\Modules\Dispute\Domain\Enums\DisputeStatus;
use App\Modules\Dispute\Domain\Events\DisputeOpened;
use App\Modules\Dispute\Domain\Events\DisputeResolved;
use App\Modules\Dispute\Infrastructure\Repositories\DisputeRepository;
use App\Modules\Payment\Domain\Contracts\PaymentContract;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use InvalidArgumentException;
use RuntimeException;

class DisputeService implements DisputeContract
{
    private const TRANSITIONS = [
        'open' => ['under_review', 'resolved', 'rejected'],
        'under_review' => ['awaiting_customer', 'awaiting_atelier', 'resolved', 'rejected'],
        'awaiting_customer' => ['under_review', 'awaiting_atelier', 'resolved', 'rejected'],
        'awaiting_atelier' => ['under_review', 'awaiting_customer', 'resolved', 'rejected'],
        'resolved' => [],
        'rejected' => [],
    ];

    public function __construct(
        private readonly DisputeRepository $disputes,
        private readonly PaymentContract $payments,
        private readonly BookingStateMachine $bookingStateMachine,
    ) {}

    public function open(int $bookingId, int $openedBy, string $reason, string $description): int
    {
        $disputeId = $this->disputes->store($bookingId, $openedBy, $reason, $description);

        Event::dispatch(new DisputeOpened($disputeId, $bookingId));

        return $disputeId;
    }

    public function classify(int $disputeId, string $status, int $actorId): void
    {
        $target = DisputeStatus::from($status);
        $current = $this->requireDispute($disputeId)['status'];

        if (! in_array($target->value, self::TRANSITIONS[$current] ?? [], true)) {
            throw new InvalidArgumentException(sprintf('Dispute #%d cannot transition from "%s" to "%s".', $disputeId, $current, $status));
        }

        $this->disputes->updateStatus($disputeId, $target->value);
    }

    public function resolve(int $disputeId, string $resolution, int $resolvedBy): void
    {
        $dispute = $this->requireDispute($disputeId);

        if ($dispute['status'] === DisputeStatus::Resolved->value || $dispute['status'] === DisputeStatus::Rejected->value) {
            throw new InvalidArgumentException(sprintf('Dispute #%d is already closed.', $disputeId));
        }

        $this->disputes->updateStatus($disputeId, DisputeStatus::Resolved->value, $resolution, $resolvedBy);

        Event::dispatch(new DisputeResolved($disputeId, (int) $dispute['booking_id']));
    }

    public function reject(int $disputeId, int $resolvedBy): void
    {
        $dispute = $this->requireDispute($disputeId);

        if ($dispute['status'] === DisputeStatus::Resolved->value || $dispute['status'] === DisputeStatus::Rejected->value) {
            throw new InvalidArgumentException(sprintf('Dispute #%d is already closed.', $disputeId));
        }

        $this->disputes->updateStatus($disputeId, DisputeStatus::Rejected->value, null, $resolvedBy);

        Event::dispatch(new DisputeResolved($disputeId, (int) $dispute['booking_id']));
    }

    public function openDispute(int $bookingId, int $openedBy, string $reason, string $description, ?array $evidence = null): Dispute
    {
        $disputeId = $this->open($bookingId, $openedBy, $reason, $description);
        $dispute = Dispute::findOrFail($disputeId);

        $booking = Booking::findOrFail($bookingId);
        $this->bookingStateMachine->apply($booking, BookingStatus::Disputed);
        $booking->save();

        return $dispute;
    }

    public function addDisputeMessage(int $disputeId, int $senderId, string $message, ?array $attachments = null, bool $isAdminNote = false): DisputeMessage
    {
        return DisputeMessage::create([
            'dispute_id' => $disputeId,
            'user_id' => $senderId,
            'message' => $message,
            'attachments' => $attachments,
            'is_admin_note' => $isAdminNote,
        ]);
    }

    public function transitionStatus(int $disputeId, string $status, int $actorId): void
    {
        $this->classify($disputeId, $status, $actorId);
    }

    public function resolveDispute(int $disputeId, DisputeResolutionDTO $dto, int $resolvedBy): void
    {
        DB::transaction(function () use ($disputeId, $dto, $resolvedBy) {
            $dispute = Dispute::findOrFail($disputeId);
            $booking = Booking::findOrFail($dispute->booking_id);

            if ($dto->verdict === 'favor_customer' && $dto->refundAmountOverride !== null) {
                $this->payments->processCustomerRefund($booking, $dto->refundAmountOverride);
            }

            $dispute->update([
                'status' => DisputeStatus::Resolved,
                'arbitration_status' => $dto->verdict,
                'arbitration_resolution' => $dto->resolutionNotes,
                'resolution_amount' => $dto->refundAmountOverride?->amount(),
                'resolved_by' => $resolvedBy,
                'resolved_at' => now(),
            ]);

            $this->bookingStateMachine->apply($booking, BookingStatus::Completed);
            $booking->save();

            Event::dispatch(new DisputeResolved($dispute->id, $booking->id));
        });
    }

    private function requireDispute(int $disputeId): array
    {
        $dispute = $this->disputes->find($disputeId);

        if ($dispute === null) {
            throw new RuntimeException(sprintf('Dispute #%d not found.', $disputeId));
        }

        return $dispute;
    }
}
