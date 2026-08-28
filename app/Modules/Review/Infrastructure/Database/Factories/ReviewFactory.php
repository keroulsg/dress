<?php

declare(strict_types=1);

namespace App\Modules\Review\Infrastructure\Database\Factories;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Review\Domain\Entities\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'renter_id' => User::factory(),
            'dress_id' => Dress::factory(),
            'atelier_id' => Atelier::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->paragraph(),
            'atelier_reply' => null,
            'atelier_replied_at' => null,
        ];
    }
}
