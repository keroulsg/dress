<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\PlatformSetting;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformVatSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_vat_is_disabled_by_default_in_admin_settings(): void
    {
        $admin = User::factory()->create(['role' => 'superadmin']);

        $response = $this->actingAs($admin)->get('/admin/settings');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Settings/Index')
            ->where('settings.vat_enabled', false)
            ->where('settings.vat_rate', 0.14)
        );

        $this->assertFalse((bool) PlatformSetting::get('vat_enabled', false));
        $this->assertEquals(0.14, (float) PlatformSetting::get('vat_rate', 0.14));
    }

    public function test_superadmin_can_toggle_vat_enabled_on_and_off(): void
    {
        $admin = User::factory()->create(['role' => 'superadmin']);

        // Enable VAT
        $enableResponse = $this->actingAs($admin)->put('/admin/settings', [
            'platform_commission_rate' => 0.15,
            'default_escrow_deposit_percent' => 0.25,
            'rental_buffer_days' => 2,
            'require_kyc_for_booking' => true,
            'vat_enabled' => true,
            'vat_rate' => 0.14,
        ]);
        $enableResponse->assertRedirect();
        $this->assertTrue((bool) PlatformSetting::get('vat_enabled'));

        // Disable VAT again
        $disableResponse = $this->actingAs($admin)->put('/admin/settings', [
            'platform_commission_rate' => 0.15,
            'default_escrow_deposit_percent' => 0.25,
            'rental_buffer_days' => 2,
            'require_kyc_for_booking' => true,
            'vat_enabled' => false,
            'vat_rate' => 0.14,
        ]);
        $disableResponse->assertRedirect();
        $this->assertFalse((bool) PlatformSetting::get('vat_enabled'));
    }
}
