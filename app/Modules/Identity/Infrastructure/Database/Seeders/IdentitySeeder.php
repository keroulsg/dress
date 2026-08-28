<?php

declare(strict_types=1);

namespace App\Modules\Identity\Infrastructure\Database\Seeders;

use App\Modules\Identity\Domain\Entities\User;
use App\Modules\KYC\Domain\Entities\KycVerification;
use Illuminate\Database\Seeder;

class IdentitySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->superadmin()->create([
            'name' => 'Platform Admin',
            'email' => 'admin@dress.test',
            'phone' => '0500000001',
            'password' => 'password',
        ]);

        $owners = [];
        $ownerCities = [
            ['name' => 'Noor Atelier', 'city' => 'Riyadh'],
            ['name' => 'Maison Élégance', 'city' => 'Cairo'],
            ['name' => 'La Couture House', 'city' => 'Riyadh'],
        ];

        foreach ($ownerCities as $index => $owner) {
            $owners[] = User::factory()->atelierOwner()->create([
                'name' => $owner['name'].' Owner',
                'email' => "owner{$index}@dress.test",
                'phone' => '0500000'.str_pad((string) (10 + $index), 3, '0', STR_PAD_LEFT),
            ]);
        }

        $staffRoles = [
            ['role' => 'manager', 'index' => 0],
            ['role' => 'inventory_manager', 'index' => 1],
            ['role' => 'inspector', 'index' => 2],
            ['role' => 'inspector', 'index' => 0],
            ['role' => 'staff', 'index' => 1],
        ];

        foreach ($staffRoles as $staff) {
            User::factory()->atelierStaff()->create([
                'name' => ucfirst($staff['role']).' Staff '.$staff['index'],
                'email' => 'staff'.str_replace(' ', '_', $staff['role']).$staff['index'].'@dress.test',
                'phone' => '0500'.str_pad((string) rand(1000, 9999), 4, '0', STR_PAD_LEFT),
            ]);
        }

        $renters = collect();

        for ($i = 0; $i < 10; $i++) {
            $renters->push(User::factory()->renter()->create([
                'name' => fake()->name(),
                'email' => "renter{$i}@dress.test",
                'phone' => '05'.str_pad((string) rand(10000000, 99999999), 8, '0', STR_PAD_LEFT),
            ]));
        }

        foreach ($renters->take(5) as $renter) {
            KycVerification::query()->create([
                'user_id' => $renter->id,
                'status' => 'approved',
                'document_type' => 'national_id',
                'front_path' => 'kyc/users/'.$renter->id.'/front.jpg',
                'back_path' => 'kyc/users/'.$renter->id.'/back.jpg',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);
        }

        foreach ($renters->slice(5, 2) as $renter) {
            KycVerification::query()->create([
                'user_id' => $renter->id,
                'status' => 'pending',
                'document_type' => 'passport',
                'front_path' => 'kyc/users/'.$renter->id.'/front.jpg',
            ]);
        }

        $this->command?->info('Identity seeded: admin, 3 owners, 5 staff, 10 renters (5 approved KYC, 2 pending).');
    }
}
