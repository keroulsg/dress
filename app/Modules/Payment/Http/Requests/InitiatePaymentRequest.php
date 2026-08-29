<?php

declare(strict_types=1);

namespace App\Modules\Payment\Http\Requests;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Foundation\Http\FormRequest;

class InitiatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        if (! $booking instanceof Booking) {
            return false;
        }

        $user = $this->user();

        if ($user instanceof User && $user->isSuperadmin()) {
            return true;
        }

        return $booking->renter_id === $this->user()?->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payment_method' => ['required', 'string', 'in:credit_card,mada,knet,apple_pay,mock_card,mock_card_success,mock_card_3ds,mock_card_declined'],
            'idempotency_token' => ['required', 'string', 'max:64'],
        ];
    }
}
