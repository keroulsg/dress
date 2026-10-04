<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Modules\Booking\Domain\Entities\Booking;
use App\Modules\Booking\Domain\Entities\BookingItem;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_when_accessing_admin(): void
    {
        $response = $this->get('/admin/finance');
        $response->assertRedirect('/login');

        $responseCategories = $this->get('/admin/categories');
        $responseCategories->assertRedirect('/login');
    }

    public function test_renter_cannot_access_admin_and_receives_403(): void
    {
        $renter = User::factory()->create(['role' => 'renter']);

        $response = $this->actingAs($renter)->get('/admin/finance');
        $response->assertStatus(403);

        $responseCategories = $this->actingAs($renter)->get('/admin/categories');
        $responseCategories->assertStatus(403);
    }

    public function test_superadmin_can_access_admin_finance_and_categories(): void
    {
        $admin = User::factory()->create([
            'role' => 'superadmin',
            'email' => 'admin@dress.test',
        ]);

        $response = $this->actingAs($admin)->get('/admin/finance');
        $response->assertStatus(200);

        $responseCategories = $this->actingAs($admin)->get('/admin/categories');
        $responseCategories->assertStatus(200);
    }

    public function test_superadmin_can_access_admin_bookings_with_dresses(): void
    {
        $admin = User::factory()->create([
            'role' => 'superadmin',
            'email' => 'admin2@dress.test',
        ]);

        $booking = Booking::factory()->create();
        $dress = Dress::factory()->create();
        BookingItem::factory()->create([
            'booking_id' => $booking->id,
            'dress_id' => $dress->id,
        ]);

        $response = $this->actingAs($admin)->get('/admin/bookings');
        $response->assertStatus(200);
    }

    public function test_superadmin_can_access_admin_kyc(): void
    {
        $admin = User::factory()->create([
            'role' => 'superadmin',
            'email' => 'admin_kyc@dress.test',
        ]);

        $response = $this->actingAs($admin)->get('/admin/kyc');
        $response->assertStatus(200);
    }

    public function test_atelier_owner_cannot_access_admin_kyc(): void
    {
        $owner = User::factory()->create([
            'role' => 'atelier_owner',
            'email' => 'owner_test@dress.test',
        ]);

        $response = $this->actingAs($owner)->get('/admin/kyc');
        $response->assertStatus(403);
    }
}
