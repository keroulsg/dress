<?php

declare(strict_types=1);

namespace App\Modules\KYC\Infrastructure\Database\Factories;

use App\Modules\Identity\Domain\Entities\User;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Domain\Enums\KycStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KycVerification>
 */
class KycVerificationFactory extends Factory
{
    protected $model = KycVerification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => fake()->randomElement(KycStatus::cases())->value,
            'document_type' => fake()->randomElement(['national_id', 'passport', 'residence_permit']),
            'front_path' => fake()->filePath(),
            'back_path' => fake()->boolean() ? fake()->filePath() : null,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'status' => KycStatus::Pending->value,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'status' => KycStatus::Approved->value,
            'reviewed_by' => User::factory(),
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'status' => KycStatus::Rejected->value,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => fake()->sentence(),
        ]);
    }
}
