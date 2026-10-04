<?php

declare(strict_types=1);

namespace Tests\Feature\Atelier;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AtelierSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $ownerA;

    private User $ownerB;

    private User $renter;

    private Atelier $atelierA;

    private Atelier $atelierB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ownerA = UserFactory::new()->atelierOwner()->create();
        $this->ownerB = UserFactory::new()->atelierOwner()->create();
        $this->renter = UserFactory::new()->renter()->create();

        $this->atelierA = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->ownerA->id]);
        $this->atelierB = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->ownerB->id]);
    }

    public function test_guest_visiting_atelier_route_is_redirected_to_login(): void
    {
        $response = $this->get("/atelier/{$this->atelierA->id}/dresses");

        $response->assertRedirect('/login');
    }

    public function test_regular_renter_visiting_atelier_dresses_receives_403_forbidden(): void
    {
        $response = $this->actingAs($this->renter)
            ->get("/atelier/{$this->atelierA->id}/dresses");

        $response->assertForbidden();
    }

    public function test_regular_renter_visiting_atelier_root_receives_403_forbidden(): void
    {
        $response = $this->actingAs($this->renter)
            ->get('/atelier');

        $response->assertForbidden();
    }

    public function test_atelier_owner_a_visiting_atelier_owner_b_dashboard_receives_403_forbidden(): void
    {
        $response = $this->actingAs($this->ownerA)
            ->get("/atelier/{$this->atelierB->id}/dresses");

        $response->assertForbidden();
    }

    public function test_atelier_owner_can_access_their_own_dashboard(): void
    {
        $response = $this->actingAs($this->ownerA)
            ->get("/atelier/{$this->atelierA->id}/dresses");

        $response->assertOk();
    }
}
