<?php

declare(strict_types=1);

namespace App\Modules\Booking\Application\Services;

use App\Modules\Availability\Domain\Contracts\AvailabilityContract;
use App\Modules\Availability\Domain\Enums\AvailabilityHoldReason;
use App\Modules\Availability\Domain\ValueObjects\DateRange;
use App\Modules\Booking\Application\DTOs\CreateBookingDTO;
use App\Modules\Booking\Domain\Contracts\BookingOrchestratorContract;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Enums\BookingStatus;
use App\Modules\Booking\Domain\Events\BookingCancelled;
use App\Modules\Booking\Domain\Events\BookingStatusChanged;
use App\Modules\Booking\Domain\Exceptions\BookingCheckoutException;
use App\Modules\Booking\Domain\Exceptions\BookingNotFoundException;
use App\Modules\Booking\Domain\State\BookingStateMachine;
use App\Modules\Booking\Infrastructure\Repositories\BookingRepository;
use App\Modules\Catalog\Domain\Contracts\CatalogReader;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Inventory\Domain\Contracts\InventoryStateManager;
use App\Modules\KYC\Domain\Contracts\KycContract;
use App\Modules\Notification\Application\DTOs\NotificationEnvelopeDTO;
use App\Modules\Notification\Domain\Contracts\NotificationContract;
use App\Modules\Pricing\Application\DTOs\PricingCalculationDTO;
use App\Modules\Pricing\Domain\Contracts\PricingContract;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

/**
 * Booking aggregate orchestrator. Creation is atomic; every lifecycle change
 * flows through BookingStateMachine and is permission gated.
 */
class BookingService implements BookingOrchestratorContract
{
    private const CURRENCY = 'EGP';

    public function __construct(
        private readonly BookingRepository $repository,
        private readonly BookingStateMachine $stateMachine,
        private readonly AvailabilityContract $availability,
        private readonly PricingContract $pricing,
        private readonly CatalogReader $catalog,
        private readonly KycContract $kyc,
        private readonly NotificationContract $notification,
        private readonly InventoryStateManager $inventory,
    ) {}

    public function createBooking(CreateBookingDTO $dto): Booking
    {
        if ($dto->clientToken !== null) {
            $replay = $this->repository->findByClientToken($dto->clientToken);

            if ($replay !== null) {
                return $replay;
            }
        }

        return DB::transaction(function () use ($dto): Booking {
            $renter = User::query()->find($dto->renterId);

            if ($renter === null || $renter->role !== 'renter') {
                throw BookingCheckoutException::ineligibleRenter();
            }

            if (! $this->kyc->isUserVerified($dto->renterId)) {
                throw BookingCheckoutException::kycRequired();
            }

            $dress = $this->catalog->getDressSnapshot($dto->dressId);
            $range = DateRange::between($dto->startDate, $dto->endDate);
            $rentalDays = $range->dayCount();

            $breakdown = $this->pricing->calculateBookingTotal(new PricingCalculationDTO(
                renterId: $dto->renterId,
                atelierId: $dto->atelierId,
                items: [['dress_id' => $dto->dressId, 'daily_rate' => $dress->rentalPricePerDay->amount()]],
                startDate: $dto->startDate,
                endDate: $dto->endDate,
                rentalDays: $rentalDays,
                cleaningFee: $dress->cleaningFee->amount(),
                taxRate: (float) config('pricing.tax_rate', 0.14),
                securityDeposit: $dress->securityDepositAmount->amount(),
                currency: self::CURRENCY,
            ));

            $booking = $this->repository->createBooking([
                'booking_reference' => $this->uniqueReference(),
                'client_token' => $dto->clientToken,
                'renter_id' => $dto->renterId,
                'atelier_id' => $dto->atelierId,
                'fitting_datetime' => $dto->fittingDatetime,
                'start_date' => $dto->startDate->toDateString(),
                'end_date' => $dto->endDate->toDateString(),
                'rental_days_count' => $rentalDays,
                'rental_rate_total' => $breakdown->rentalSubtotal->amount(),
                'cleaning_fee_total' => $breakdown->cleaningFee->amount(),
                'security_deposit_amount' => $breakdown->securityDeposit->amount(),
                'late_fee_total' => '0',
                'discount_amount' => $breakdown->discountAmount->amount(),
                'tax_amount' => $breakdown->taxAmount->amount(),
                'grand_total' => $breakdown->grandTotal->amount(),
                'deposit_held' => $breakdown->securityDeposit->amount(),
                'deposit_refunded' => '0',
                'deposit_deducted' => '0',
                'currency' => self::CURRENCY,
                'status' => BookingStatus::PendingPayment->value,
            ]);

            // Authoritative atomic lock; on overlap the transaction rolls back
            // and the booking row is never persisted.
            $this->availability->lockDatesForBooking(
                $dto->dressId,
                $range,
                AvailabilityHoldReason::ConfirmedBooking->value,
                $booking->id,
            );

            $this->repository->createItem($booking->id, [
                'dress_id' => $dto->dressId,
                'dress_size_id' => $dto->dressSizeId,
                'quantity' => 1,
                'unit_rental_price' => $dress->rentalPricePerDay->amount(),
                'rental_days' => $rentalDays,
                'subtotal' => $breakdown->rentalSubtotal->amount(),
            ]);

            return $booking;
        });
    }

    public function transitionStatus(int $bookingId, BookingStatus $targetStatus, array $context = []): Booking
    {
        return DB::transaction(function () use ($bookingId, $targetStatus, $context): Booking {
            $booking = $this->repository->find($bookingId);

            if ($booking === null) {
                throw new BookingNotFoundException($bookingId);
            }

            $from = $booking->status;
            $this->stateMachine->assertTransition($from, $targetStatus);

            $actorId = $context['actor_id'] ?? null;
            $this->authorizeTransition($booking, $targetStatus, $actorId);

            $this->applyEffects($booking, $this->stateMachine->effectsFor($from, $targetStatus), $context);

            if (in_array($targetStatus, [BookingStatus::Cancelled, BookingStatus::Expired], true)) {
                $booking->cancellation_reason = $context['reason'] ?? ($targetStatus === BookingStatus::Expired ? 'Payment window expired.' : null);
                $booking->cancelled_at = now();
                $booking->cancelled_by = is_int($actorId) ? $actorId : null;
            }

            $this->stateMachine->apply($booking, $targetStatus);
            $this->repository->save($booking);

            Event::dispatch(new BookingStatusChanged($booking->id, $from->value, $targetStatus->value));

            if ($targetStatus === BookingStatus::Cancelled) {
                Event::dispatch(new BookingCancelled($booking->id, (string) $booking->cancellation_reason));
            }

            return $booking;
        });
    }

    public function scheduleFitting(int $bookingId, CarbonInterface $fittingDateTime, array $context = []): Booking
    {
        return DB::transaction(function () use ($bookingId, $fittingDateTime): Booking {
            $booking = $this->repository->find($bookingId);

            if ($booking === null) {
                throw new BookingNotFoundException($bookingId);
            }

            $booking->fitting_datetime = $fittingDateTime;
            $this->repository->save($booking);

            if ($booking->status !== BookingStatus::FittingScheduled) {
                $this->stateMachine->apply($booking, BookingStatus::FittingScheduled);
                $this->repository->save($booking);

                Event::dispatch(new BookingStatusChanged($booking->id, $booking->getOriginal('status'), BookingStatus::FittingScheduled->value));
            }

            return $booking;
        });
    }

    public function cancelBooking(int $bookingId, int $actorUserId, string $reason): Booking
    {
        $user = User::query()->find($actorUserId);

        if ($user === null) {
            abort(403);
        }

        $booking = $this->repository->find($bookingId);

        if ($booking === null) {
            throw new BookingNotFoundException($bookingId);
        }

        Gate::forUser($user)->authorize('cancel', $booking);

        return $this->transitionStatus($bookingId, BookingStatus::Cancelled, [
            'actor_id' => $actorUserId,
            'reason' => $reason,
        ]);
    }

    public function expirePendingBookings(int $timeoutMinutes = 30): int
    {
        $threshold = now()->subMinutes($timeoutMinutes);
        $expired = 0;

        foreach ($this->repository->pendingExpired($threshold) as $booking) {
            $this->transitionStatus($booking->id, BookingStatus::Expired, ['actor_id' => null]);
            $expired++;
        }

        return $expired;
    }

    private function authorizeTransition(Booking $booking, BookingStatus $to, int|string|null $actorId): void
    {
        $actor = $this->stateMachine->actorFor($booking->status, $to);

        if ($actor === 'system') {
            if ($actorId === null) {
                return;
            }

            $user = User::query()->find($actorId);

            if ($user === null || ! $user->isSuperadmin()) {
                abort(403);
            }

            return;
        }

        if (! is_int($actorId)) {
            abort(403);
        }

        $user = User::query()->find($actorId);

        if ($user === null) {
            abort(403);
        }

        if ($actor === 'renter') {
            if ($booking->renter_id === $user->id || $user->isSuperadmin()) {
                return;
            }

            abort(403);
        }

        if ($actor === 'atelier') {
            Gate::forUser($user)->authorize('updateStatus', $booking);

            return;
        }

        if ($actor === 'any') {
            if ($booking->renter_id === $user->id || $user->isSuperadmin()) {
                return;
            }

            Gate::forUser($user)->authorize('updateStatus', $booking);
        }
    }

    /**
     * @param  list<string>  $effects
     * @param  array<string, mixed>  $context
     */
    private function applyEffects(Booking $booking, array $effects, array $context): void
    {
        $actorId = (int) ($context['actor_id'] ?? 0);

        foreach ($effects as $effect) {
            match ($effect) {
                'release_dates' => $this->releaseHolds($booking),
                'mark_rented' => $this->applyToEachDress($booking, fn (int $dressId): mixed => $this->inventory->markRented($dressId, $actorId)),
                'mark_cleaning' => $this->applyToEachDress($booking, fn (int $dressId): mixed => $this->inventory->markCleaning($dressId, $actorId)),
                'mark_available' => $this->applyToEachDress($booking, fn (int $dressId): mixed => $this->inventory->markAvailable($dressId, $actorId)),
                'mark_dispatched_at' => $booking->actual_dispatched_at = now(),
                'mark_received_at' => $booking->actual_received_at = now(),
                'mark_returned_at' => $booking->actual_returned_at = now(),
                'notify_expired' => $this->notifyRenter($booking, 'booking_expired', 'Booking expired', sprintf('Booking #%s expired because payment was not completed.', $booking->booking_reference)),
                'notify_cancelled' => $this->notifyRenter($booking, 'booking_cancelled', 'Booking cancelled', sprintf('Booking #%s was cancelled.', $booking->booking_reference)),
                'notify_dispatched' => $this->notifyRenter($booking, 'booking_dispatched', 'Booking dispatched', sprintf('Booking #%s is on its way.', $booking->booking_reference)),
                'notify_received' => $this->notifyRenter($booking, 'booking_received', 'Booking received', sprintf('Enjoy your dress! Booking #%s.', $booking->booking_reference)),
                'notify_returned' => $this->notifyRenter($booking, 'booking_returned', 'Return received', sprintf('Your return for booking #%s is being inspected.', $booking->booking_reference)),
                'notify_inspected' => $this->notifyRenter($booking, 'inspection_completed', 'Inspection completed', sprintf('The inspection for booking #%s is complete.', $booking->booking_reference)),
                'notify_disputed' => $this->notifyRenter($booking, 'booking_disputed', 'Booking disputed', sprintf('A dispute was opened for booking #%s.', $booking->booking_reference)),
                'notify_completed' => $this->notifyRenter($booking, 'booking_completed', 'Booking completed', sprintf('Booking #%s is complete. Thank you!', $booking->booking_reference)),
                'notify_resolved' => $this->notifyRenter($booking, 'dispute_resolved', 'Dispute resolved', sprintf('The dispute on booking #%s was resolved.', $booking->booking_reference)),
                default => null,
            };
        }
    }

    private function releaseHolds(Booking $booking): void
    {
        $this->availability->releaseDatesForBooking(AvailabilityHoldReason::ConfirmedBooking->value, $booking->id);
        $this->availability->releaseDatesForBooking(AvailabilityHoldReason::Fitting->value, $booking->id);
    }

    private function applyToEachDress(Booking $booking, Closure $callback): void
    {
        foreach ($booking->items as $item) {
            $callback((int) $item->dress_id);
        }
    }

    private function notifyRenter(Booking $booking, string $type, string $title, string $body): void
    {
        $this->notification->send(new NotificationEnvelopeDTO(
            recipientId: $booking->renter_id,
            type: $type,
            title: $title,
            body: $body,
        ));
    }

    private function uniqueReference(): string
    {
        do {
            $reference = 'DRESS-'.now()->format('Ymd').'-'.strtoupper(Str::random(4));
        } while ($this->repository->referenceExists($reference));

        return $reference;
    }
}
