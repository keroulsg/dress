<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Atelier\Infrastructure\Database\Seeders\AtelierSeeder;
use App\Modules\Booking\Infrastructure\Database\Seeders\BookingSeeder;
use App\Modules\Catalog\Infrastructure\Database\Seeders\CatalogSeeder;
use App\Modules\Finance\Infrastructure\Database\Seeders\FinanceSeeder;
use App\Modules\Identity\Infrastructure\Database\Seeders\IdentitySeeder;
use App\Modules\Pricing\Infrastructure\Database\Seeders\CouponSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            FinanceSeeder::class,
            IdentitySeeder::class,
            AtelierSeeder::class,
            CatalogSeeder::class,
            BookingSeeder::class,
            CouponSeeder::class,
        ]);
    }
}
