<?php

declare(strict_types=1);

namespace Tests\Feature\Legal;

use Tests\TestCase;

class PaymobComplianceTest extends TestCase
{
    public function test_refund_policy_page_is_accessible(): void
    {
        $response = $this->get(route('legal.refund-policy'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Legal/RefundPolicy'));
    }

    public function test_shipping_policy_page_is_accessible(): void
    {
        $response = $this->get(route('legal.shipping-policy'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Legal/ShippingPolicy'));
    }

    public function test_contact_page_is_accessible(): void
    {
        $response = $this->get(route('legal.contact'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Legal/Contact'));
    }

    public function test_contact_form_submission(): void
    {
        $payload = [
            'name' => 'Sara Ahmed',
            'email' => 'sara@example.com',
            'phone' => '+201012345678',
            'subject' => 'استفسار بخصوص سياسة الاسترجاع',
            'message' => 'أود الاستفسار عن تفاصيل استرداد التأمين للقطعة المحجوزة.',
        ];

        $response = $this->post(route('legal.contact.submit'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }
}
