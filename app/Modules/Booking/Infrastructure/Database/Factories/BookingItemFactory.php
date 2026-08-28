<?php

declare(strict_types=1);

namespace App\Modules\Booking\Infrastructure\Database\Factories;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Entities\BookingItem;
use App\Modules\Catalog\Domain\Entities\Dress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookingItem>
 */
class BookingItemFactory extends Factory
{
    protected $model = BookingItem::class;

    public function definition(): array
    {
        $unitRentalPrice = fake()->randomFloat(2, 100, 8000);

        return [
            'booking_id' => Booking::factory(),
            'dress_id' => Dress::factory(),
            'dress_size_id' => null,
            'quantity' => 1,
            'unit_rental_price' => $unitRentalPrice,
            'rental_days' => 3,
            'subtotal' => round($unitRentalPrice * 3, 2),
        ];
    }
}
