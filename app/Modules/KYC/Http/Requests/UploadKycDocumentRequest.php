<?php

declare(strict_types=1);

namespace App\Modules\KYC\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadKycDocumentRequest extends FormRequest
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
        return [
            'document_type' => ['required', 'string', 'in:'.implode(',', (array) config('kyc.document_types', []))],
            'front' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'],
            'back' => ['nullable', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:5120'],
        ];
    }
}
