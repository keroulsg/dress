<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FilterCatalogRequest extends FormRequest
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
        return [
            'category' => ['nullable', 'array'],
            'category.*' => ['integer', 'exists:categories,id'],
            'sizes' => ['nullable', 'array'],
            'sizes.*' => ['string', 'in:XS,S,M,L,XL,2XL,CUSTOM'],
            'silhouettes' => ['nullable', 'array'],
            'silhouettes.*' => ['string', 'max:100'],
            'fabrics' => ['nullable', 'array'],
            'fabrics.*' => ['string', 'max:100'],
            'colors' => ['nullable', 'array'],
            'colors.*' => ['string', 'max:100'],
            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', 'string', 'in:price_asc,price_desc,newest,popular'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
