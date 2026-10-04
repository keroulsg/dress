<?php

declare(strict_types=1);

namespace Tests\Feature\Storefront;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontHomeAndNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_storefront_home_renders_successfully(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
