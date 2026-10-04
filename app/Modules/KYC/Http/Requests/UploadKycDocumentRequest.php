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

    protected function prepareForValidation(): void
    {
        if (! $this->hasFile('front') && $this->hasFile('document_file')) {
            $this->files->set('front', $this->file('document_file'));
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'document_type' => ['nullable', 'string'],
            'front' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
            'back' => ['nullable', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
        ];
    }
}
