<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Requests;

use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateDressRequest extends FormRequest
{
    public function authorize(): bool
    {
        $dress = $this->route('dress');

        return $dress instanceof Dress && Gate::allows('update', $dress);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'integer', function ($attribute, $value, $fail): void {
                if (! Category::query()->whereKey($value)->where('is_active', true)->exists()) {
                    $fail('The selected category is invalid or inactive.');
                }
            }],
            'description' => ['nullable', 'string', 'max:5000'],
            'fabric_type' => ['nullable', 'string', 'max:100'],
            'silhouette' => ['nullable', 'string', 'max:100'],
            'color_primary' => ['nullable', 'string', 'max:100'],
            'original_retail_value' => ['nullable', 'numeric', 'min:0'],
            'rental_price_per_day' => ['sometimes', 'required', 'numeric', 'min:1'],
            'security_deposit_amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'cleaning_fee' => ['nullable', 'numeric', 'min:0'],
            'late_fee_per_day' => ['sometimes', 'required', 'numeric', 'min:0'],
            'turnaround_buffer_days' => ['nullable', 'integer', 'min:0', 'max:14'],
            'condition_rating' => ['nullable', 'string', 'in:brand_new,like_new,good,minor_flaws'],
            'sizes' => ['nullable', 'array', 'max:7'],
            'sizes.*.size_code' => ['required', 'string', 'in:XS,S,M,L,XL,2XL,CUSTOM'],
            'sizes.*.bust' => ['nullable', 'numeric', 'min:0'],
            'sizes.*.waist' => ['nullable', 'numeric', 'min:0'],
            'sizes.*.hips' => ['nullable', 'numeric', 'min:0'],
            'sizes.*.length' => ['nullable', 'numeric', 'min:0'],
            'images' => ['nullable', 'array', 'max:12'],
            'images.*' => ['file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ];
    }
}
