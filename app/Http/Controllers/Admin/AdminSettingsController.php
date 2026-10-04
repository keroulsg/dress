<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    public function index(): Response
    {
        $settings = [
            'platform_commission_rate' => 0.15,
            'default_escrow_deposit_percent' => 0.20,
            'rental_buffer_days' => 2,
            'auto_payout_threshold' => 1000,
            'require_kyc_for_booking' => true,
            'maintenance_mode' => false,
            'support_email' => 'support@maisonrentale.com',
            'support_phone' => '+20 100 000 0000',
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'platform_commission_rate' => 'required|numeric|min:0|max:1',
            'default_escrow_deposit_percent' => 'required|numeric|min:0|max:1',
            'rental_buffer_days' => 'required|integer|min:0|max:14',
            'require_kyc_for_booking' => 'required|boolean',
        ]);

        return back()->with('success', 'تم حفظ إعدادات المنصة المركزية بنجاح.');
    }
}
