<?php

namespace Tests\Feature\Feature\Review;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewEligibilityAndRatingSyncTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }
}
