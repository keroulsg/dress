<?php

declare(strict_types=1);

namespace App\Modules\Booking\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxDays = (int) config('availability.max_rental_days', 14);

        return [
            'dress_id' => ['required', 'integer', 'exists:dresses,id'],
            'dress_size_id' => ['nullable', 'integer', 'exists:dress_sizes,id'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date', 'before_or_equal:'.now()->addDays($maxDays)->toDateString()],
            'fitting_datetime' => ['nullable', 'date', 'before:start_date'],
            'delivery_address' => ['required', 'string', 'max:500'],
            'client_token' => ['required', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.before_or_equal' => 'The rental duration exceeds the maximum allowed booking window.',
            'fitting_datetime.before' => 'The fitting must be scheduled before the rental start date.',
        ];
    }
}
