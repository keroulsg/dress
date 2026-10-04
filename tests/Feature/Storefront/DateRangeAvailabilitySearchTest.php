<?php

namespace Tests\Feature\Storefront;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DateRangeAvailabilitySearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_renders_with_dates(): void
    {
        $response = $this->get('/catalog?start_date=2026-09-01&end_date=2026-09-05');

        $response->assertStatus(200);
    }
}
