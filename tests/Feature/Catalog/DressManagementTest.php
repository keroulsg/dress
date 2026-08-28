<?php

declare(strict_types=1);

namespace Tests\Feature\Catalog;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Domain\Entities\AtelierStaff;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressImage;
use App\Modules\Catalog\Domain\Entities\DressSize;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DressManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Atelier $atelier;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->owner = UserFactory::new()->atelierOwner()->create();
        $this->atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->owner->id]);
        $this->category = CategoryFactory::new()->create(['name' => 'Evening Soirée', 'slug' => 'evening-soiree']);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Celestial Gown',
            'category_id' => $this->category->id,
            'description' => 'A dreamy couture gown.',
            'fabric_type' => 'Silk Chiffon',
            'silhouette' => 'Mermaid',
            'color_primary' => 'Ivory',
            'original_retail_value' => 8000,
            'rental_price_per_day' => 500,
            'security_deposit_amount' => 2000,
            'cleaning_fee' => 150,
            'late_fee_per_day' => 200,
            'turnaround_buffer_days' => 2,
            'condition_rating' => 'like_new',
            'sizes' => [
                ['size_code' => 'M', 'bust' => 90, 'waist' => 70, 'hips' => 95, 'length' => 150, 'is_available' => true],
                ['size_code' => 'L', 'bust' => 96, 'waist' => 76, 'hips' => 100, 'length' => 152, 'is_available' => true],
            ],
            'images' => [
                UploadedFile::fake()->image('front.jpg', 800, 1000),
            ],
        ], $overrides);
    }

    public function test_atelier_owner_can_create_dress_with_sizes_and_images(): void
    {
        $this->actingAs($this->owner)
            ->post("/atelier/{$this->atelier->id}/dresses", $this->validPayload())
            ->assertRedirect("/atelier/{$this->atelier->id}/dresses");

        $dress = Dress::query()->where('slug', 'celestial-gown')->first();

        $this->assertNotNull($dress);
        $this->assertSame($this->atelier->id, $dress->atelier_id);
        $this->assertSame('draft', $dress->status);
        $this->assertSame(2, DressSize::query()->where('dress_id', $dress->id)->count());

        $image = DressImage::query()->where('dress_id', $dress->id)->first();
        $this->assertNotNull($image);
        $this->assertTrue($image->is_primary);
        $this->assertStringEndsWith('.webp', $image->image_path);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_owner_can_update_own_dress(): void
    {
        $dress = DressFactory::new()->create(['atelier_id' => $this->atelier->id, 'category_id' => $this->category->id]);

        $this->actingAs($this->owner)
            ->put("/atelier/{$this->atelier->id}/dresses/{$dress->id}", [
                'title' => 'Updated Gown',
                'rental_price_per_day' => 600,
                'security_deposit_amount' => 2200,
                'late_fee_per_day' => 250,
                'sizes' => [
                    ['size_code' => 'S', 'bust' => 84, 'waist' => 64, 'hips' => 88, 'length' => 145, 'is_available' => true],
                ],
            ])
            ->assertRedirect("/atelier/{$this->atelier->id}/dresses");

        $dress->refresh();

        $this->assertSame('Updated Gown', $dress->title);
        $this->assertSame('600.00', $dress->rental_price_per_day);
        $this->assertSame(1, DressSize::query()->where('dress_id', $dress->id)->count());
        $this->assertSame('S', DressSize::query()->where('dress_id', $dress->id)->value('size_code'));
    }

    public function test_cross_tenant_update_is_forbidden(): void
    {
        $otherOwner = UserFactory::new()->atelierOwner()->create();
        $otherAtelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $otherOwner->id]);
        $dress = DressFactory::new()->create(['atelier_id' => $otherAtelier->id, 'category_id' => $this->category->id]);

        $this->actingAs($this->owner)
            ->put("/atelier/{$this->atelier->id}/dresses/{$dress->id}", [
                'title' => 'Hijack',
                'rental_price_per_day' => 999,
                'security_deposit_amount' => 1,
                'late_fee_per_day' => 1,
            ])
            ->assertForbidden();

        $this->assertNotSame('Hijack', $dress->fresh()->title);
    }

    public function test_cross_tenant_delete_is_forbidden(): void
    {
        $otherOwner = UserFactory::new()->atelierOwner()->create();
        $otherAtelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $otherOwner->id]);
        $dress = DressFactory::new()->create(['atelier_id' => $otherAtelier->id, 'category_id' => $this->category->id]);

        $this->actingAs($this->owner)
            ->delete("/atelier/{$this->atelier->id}/dresses/{$dress->id}")
            ->assertForbidden();

        $this->assertNotNull($dress->fresh());
    }

    public function test_non_inventory_staff_is_denied_dress_creation(): void
    {
        $staff = UserFactory::new()->atelierStaff()->create();
        AtelierStaff::query()->create([
            'atelier_id' => $this->atelier->id,
            'user_id' => $staff->id,
            'role' => 'staff',
            'is_active' => true,
        ]);

        $this->actingAs($staff)
            ->post("/atelier/{$this->atelier->id}/dresses", $this->validPayload())
            ->assertForbidden();

        $this->assertSame(0, Dress::query()->count());
    }

    public function test_inventory_manager_staff_can_create_dress(): void
    {
        $manager = UserFactory::new()->atelierStaff()->create();
        AtelierStaff::query()->create([
            'atelier_id' => $this->atelier->id,
            'user_id' => $manager->id,
            'role' => 'inventory_manager',
            'is_active' => true,
        ]);

        $this->actingAs($manager)
            ->post("/atelier/{$this->atelier->id}/dresses", $this->validPayload())
            ->assertRedirect("/atelier/{$this->atelier->id}/dresses");

        $this->assertSame(1, Dress::query()->count());
    }
}
