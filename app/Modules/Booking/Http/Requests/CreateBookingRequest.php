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
            'dress_size_id' => ['nullable'],
            'order_type' => ['nullable', 'string', 'in:rental,direct_sale'],
            'start_date' => ['required_unless:order_type,direct_sale', 'nullable', 'date', 'after_or_equal:today'],
            'end_date' => ['required_unless:order_type,direct_sale', 'nullable', 'date', 'after_or_equal:start_date', 'before_or_equal:'.now()->addDays($maxDays)->toDateString()],
            'fitting_datetime' => ['nullable'],
            'delivery_address' => ['required', 'string', 'max:500'],
            'client_token' => ['required', 'string', 'max:64'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
            'agree_to_terms' => ['nullable'],
            'id_front' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'id_back' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
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
