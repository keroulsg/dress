<?php

declare(strict_types=1);

namespace App\Modules\Atelier\Infrastructure\Database\Seeders;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Domain\Entities\AtelierStaff;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Database\Seeder;

class AtelierSeeder extends Seeder
{
    public function run(): void
    {
        $owners = User::query()->where('role', 'atelier_owner')->orderBy('id')->get();
        $staffUsers = User::query()->where('role', 'atelier_staff')->orderBy('id')->get();

        $definitions = [
            [
                'business_name' => 'Noor Atelier',
                'slug' => 'noor-atelier',
                'license_number' => 'LIC-RIY-001',
                'city' => 'Riyadh',
                'commission_rate' => 10.00,
            ],
            [
                'business_name' => 'Maison Élégance',
                'slug' => 'maison-elegance',
                'license_number' => 'LIC-CAI-002',
                'city' => 'Cairo',
                'commission_rate' => 12.50,
            ],
            [
                'business_name' => 'La Couture House',
                'slug' => 'la-couture-house',
                'license_number' => 'LIC-RIY-003',
                'city' => 'Riyadh',
                'commission_rate' => 8.00,
            ],
        ];

        $ateliers = [];

        foreach ($definitions as $index => $definition) {
            $owner = $owners[$index] ?? null;

            if ($owner === null) {
                continue;
            }

            $atelier = Atelier::query()->create([
                ...$definition,
                'owner_user_id' => $owner->id,
                'description' => fake()->paragraph(2),
                'address' => fake()->streetAddress(),
                'latitude' => 24.7136 + (fake()->randomFloat(4, -0.1, 0.1)),
                'longitude' => 46.6753 + (fake()->randomFloat(4, -0.1, 0.1)),
                'phone' => fake()->phoneNumber(),
                'email' => $definition['slug'].'@dress.test',
                'is_active' => true,
                'approved_at' => now()->subDays(30),
                'approved_by' => User::query()->where('role', 'superadmin')->value('id'),
            ]);

            $ateliers[] = $atelier;
        }

        $assignments = [
            0 => ['manager', 'inventory_manager'],
            1 => ['inspector', 'staff'],
            2 => ['inspector'],
        ];

        $used = 0;

        foreach ($assignments as $atelierIndex => $roles) {
            $atelier = $ateliers[$atelierIndex] ?? null;

            if ($atelier === null) {
                continue;
            }

            foreach ($roles as $role) {
                $staffUser = $staffUsers[$used] ?? null;

                if ($staffUser === null) {
                    continue;
                }

                AtelierStaff::query()->create([
                    'atelier_id' => $atelier->id,
                    'user_id' => $staffUser->id,
                    'role' => $role,
                    'is_active' => true,
                ]);

                $used++;
            }
        }

        $this->command?->info('Ateliers seeded: '.count($ateliers).' approved ateliers with staff.');
    }
}
