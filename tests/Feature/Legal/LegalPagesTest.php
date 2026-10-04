<?php

declare(strict_types=1);

namespace Tests\Feature\Legal;

use Tests\TestCase;

class LegalPagesTest extends TestCase
{
    public function test_terms_page_is_accessible(): void
    {
        $response = $this->get(route('legal.terms'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Legal/Terms'));
    }

    public function test_privacy_page_is_accessible(): void
    {
        $response = $this->get(route('legal.privacy'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Legal/Privacy'));
    }
}
