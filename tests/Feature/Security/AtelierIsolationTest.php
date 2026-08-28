<?php

declare(strict_types=1);

namespace Tests\Feature\Security;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Booking\Infrastructure\Database\Factories\BookingFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AtelierIsolationTest extends TestCase
{
    use RefreshDatabase;

    private User $ownerA;

    private User $ownerB;

    private Atelier $atelierA;

    private Atelier $atelierB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ownerA = UserFactory::new()->atelierOwner()->create();
        $this->ownerB = UserFactory::new()->atelierOwner()->create();

        $this->atelierA = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->ownerA->id]);
        $this->atelierB = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->ownerB->id]);
    }

    public function test_owner_cannot_update_or_delete_another_ateliers_dress(): void
    {
        $dressOfB = DressFactory::new()->create(['atelier_id' => $this->atelierB->id]);

        $this->assertTrue(Gate::forUser($this->ownerA)->denies('update', $dressOfB));
        $this->assertTrue(Gate::forUser($this->ownerA)->denies('delete', $dressOfB));
        $this->assertTrue(Gate::forUser($this->ownerB)->allows('update', $dressOfB));
    }

    public function test_owner_cannot_view_unpublished_dress_of_another_atelier(): void
    {
        $draftOfB = DressFactory::new()->draft()->create(['atelier_id' => $this->atelierB->id]);

        $this->assertTrue(Gate::forUser($this->ownerA)->denies('view', $draftOfB));
        $this->assertTrue(Gate::forUser($this->ownerB)->allows('view', $draftOfB));
    }

    public function test_owner_cannot_view_another_ateliers_booking(): void
    {
        $bookingOfB = BookingFactory::new()->create([
            'atelier_id' => $this->atelierB->id,
            'renter_id' => UserFactory::new()->renter()->create()->id,
        ]);

        $this->assertTrue(Gate::forUser($this->ownerA)->denies('view', $bookingOfB));
        $this->assertTrue(Gate::forUser($this->ownerB)->allows('view', $bookingOfB));
    }

    public function test_cross_tenant_url_is_rejected_with_403(): void
    {
        Route::middleware(['auth', 'atelier'])->get('/_security/atelier/{atelier}/dresses', fn () => response('ok'));

        $this->actingAs($this->ownerA)
            ->get("/_security/atelier/{$this->atelierA->id}/dresses")
            ->assertOk();

        $this->actingAs($this->ownerA)
            ->get("/_security/atelier/{$this->atelierB->id}/dresses")
            ->assertForbidden();

        $this->actingAs($this->ownerB)
            ->get("/_security/atelier/{$this->atelierB->id}/dresses")
            ->assertOk();
    }

    public function test_guest_is_rejected_by_tenant_middleware(): void
    {
        Route::middleware('atelier')->get('/_security/guest/atelier/{atelier}', fn () => response('ok'));

        $this->get("/_security/guest/atelier/{$this->atelierA->id}")->assertForbidden();
    }
}
