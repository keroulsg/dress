<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinalizeInspectionRequest extends FormRequest
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
            'override_deduction' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
