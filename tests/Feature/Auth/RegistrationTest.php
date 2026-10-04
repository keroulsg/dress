<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'renter',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('storefront.catalog', absolute: false));
    }

    public function test_sellers_can_register_and_get_atelier(): void
    {
        $response = $this->post('/register', [
            'name' => 'Atelier Owner',
            'email' => 'seller@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'atelier_owner',
            'business_name' => 'Luxury Boutique',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('ateliers', [
            'business_name' => 'Luxury Boutique',
        ]);
        $response->assertRedirect('/atelier/1/dresses');
    }
}
