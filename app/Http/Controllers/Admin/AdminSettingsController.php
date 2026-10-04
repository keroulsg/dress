<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    public function index(): Response
    {
        $settings = [
            'platform_commission_rate' => (float) PlatformSetting::get('platform_commission_rate', 0.15),
            'default_escrow_deposit_percent' => (float) PlatformSetting::get('default_escrow_deposit_percent', 0.25),
            'rental_buffer_days' => (int) PlatformSetting::get('rental_buffer_days', 2),
            'auto_payout_threshold' => (int) PlatformSetting::get('auto_payout_threshold', 1000),
            'require_kyc_for_booking' => (bool) PlatformSetting::get('require_kyc_for_booking', true),
            'vat_enabled' => (bool) PlatformSetting::get('vat_enabled', false),
            'vat_rate' => (float) PlatformSetting::get('vat_rate', 0.14),
            'maintenance_mode' => (bool) PlatformSetting::get('maintenance_mode', false),
            'support_email' => (string) PlatformSetting::get('support_email', 'support@maisonrentale.com'),
            'support_phone' => (string) PlatformSetting::get('support_phone', '01156231162 / 01044200583'),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform_commission_rate' => 'required|numeric|min:0|max:1',
            'default_escrow_deposit_percent' => 'required|numeric|min:0|max:1',
            'rental_buffer_days' => 'required|integer|min:0|max:14',
            'require_kyc_for_booking' => 'required|boolean',
            'vat_enabled' => 'required|boolean',
            'vat_rate' => 'nullable|numeric|min:0|max:1',
        ]);

        foreach ($validated as $key => $value) {
            PlatformSetting::set($key, $value);
        }

        return back()->with('success', 'تم حفظ وتحديث إعدادات المنصة والسياسات المالية بنجاح.');
    }
}
