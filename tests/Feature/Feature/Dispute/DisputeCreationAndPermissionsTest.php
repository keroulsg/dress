<?php

namespace Tests\Feature\Feature\Dispute;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DisputeCreationAndPermissionsTest extends TestCase
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
