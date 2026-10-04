<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function terms(): Response
    {
        return Inertia::render('Legal/Terms', [
            'updated_at' => '2026-10-04',
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Legal/Privacy', [
            'updated_at' => '2026-10-04',
        ]);
    }

    public function refundPolicy(): Response
    {
        return Inertia::render('Legal/RefundPolicy', [
            'updated_at' => '2026-10-04',
        ]);
    }

    public function shippingPolicy(): Response
    {
        return Inertia::render('Legal/ShippingPolicy', [
            'updated_at' => '2026-10-04',
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('Legal/Contact', [
            'contact_info' => [
                'entity_name' => 'شركة ميزون رنتال لحلول الأزياء الراقية (ش.ذ.م.م)',
                'commercial_email' => 'support@maisonrentale.com',
                'phone' => '+20 2 2500 0000',
                'whatsapp' => '+20 100 000 0000',
                'address' => 'مبنى 45، شارع التسعين الشمالي، مجمع الأعمال، التجمع الخامس، القاهرة، جمهورية مصر العربية',
                'working_hours' => '10:00 صباحاً - 10:00 مساءً (السبت - الخميس)',
            ],
        ]);
    }

    public function submitContact(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        return back()->with('success', 'شكراً لتواصلكِ معنا! تم استلام رسالتكِ بنجاح وسيقوم فريق العناية بالعملاء بالرد عليكِ خلال ساعتين.');
    }
}
