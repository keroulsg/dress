<?php

declare(strict_types=1);

namespace App\Modules\Inspection\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInspectionRequest extends FormRequest
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
            'condition_summary' => ['required', 'string', 'in:perfect,normal_wear,stain_repairable,torn_repairable,total_loss'],
            'damage_description' => ['nullable', 'string', 'max:5000'],
            'damage_items' => ['nullable', 'array', 'max:20'],
            'damage_items.*.location' => ['required', 'string', 'in:chest,waist,hem,zipper,train,sleeve,bodice,lining,other'],
            'damage_items.*.damage_type' => ['required', 'string', 'in:stain,tear,missing_beads,broken_zipper,alteration,burn,water_damage,irreparable,other'],
            'damage_items.*.severity' => ['required', 'string', 'in:minor,moderate,major,critical'],
            'damage_items.*.description' => ['nullable', 'string', 'max:2000'],
            'damage_items.*.repair_cost' => ['nullable', 'numeric', 'min:0'],
            'damage_items.*.deduction_amount' => ['nullable', 'numeric', 'min:0'],
            'damage_items.*.photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ];
    }
}
