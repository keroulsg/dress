<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CalculateQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxDays = (int) config('availability.max_rental_days', 14);

        return [
            'dress_id' => ['required', 'integer', 'exists:dresses,id'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date', 'before_or_equal:'.now()->addDays($maxDays)->toDateString()],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'delivery_requested' => ['nullable', 'boolean'],
            'delivery_city' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.before_or_equal' => 'The rental duration exceeds the maximum allowed booking window.',
        ];
    }
}
