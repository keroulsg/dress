<?php

declare(strict_types=1);

namespace Tests\Feature\Catalog;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\DressSize;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CatalogBrowsingTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private Atelier $atelier;

    private Category $categoryA;

    private Category $categoryB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = UserFactory::new()->atelierOwner()->create();
        $this->atelier = AtelierFactory::new()->approved()->create(['owner_user_id' => $this->owner->id]);
        $this->categoryA = CategoryFactory::new()->create(['name' => 'Evening Soirée', 'slug' => 'evening-soiree']);
        $this->categoryB = CategoryFactory::new()->create(['name' => 'Bridal', 'slug' => 'bridal']);
    }

    public function test_catalog_returns_only_active_dresses_with_pagination(): void
    {
        DressFactory::new()->active()->create(['atelier_id' => $this->atelier->id, 'category_id' => $this->categoryA->id]);
        DressFactory::new()->active()->create(['atelier_id' => $this->atelier->id, 'category_id' => $this->categoryA->id]);
        DressFactory::new()->active()->create(['atelier_id' => $this->atelier->id, 'category_id' => $this->categoryB->id]);
        DressFactory::new()->draft()->create(['atelier_id' => $this->atelier->id, 'category_id' => $this->categoryA->id]);

        $this->get('/catalog')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Catalog/Index')
                ->has('dresses', 3)
                ->where('pagination.total', 3));
    }

    public function test_catalog_filters_by_category_size_and_price_bounds(): void
    {
        $cheap = DressFactory::new()->active()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->categoryA->id,
            'rental_price_per_day' => 300,
        ]);
        DressSize::query()->create(['dress_id' => $cheap->id, 'size_code' => 'S', 'is_available' => true]);

        $expensive = DressFactory::new()->active()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->categoryB->id,
            'rental_price_per_day' => 900,
        ]);
        DressSize::query()->create(['dress_id' => $expensive->id, 'size_code' => 'M', 'is_available' => true]);

        $this->get('/catalog?category[]='.$this->categoryA->id.'&sizes[]=S&price_max=600')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('pagination.total', 1)
                ->where('dresses.0.id', $cheap->id));
    }

    public function test_catalog_price_sort_ascending(): void
    {
        $cheap = DressFactory::new()->active()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->categoryA->id,
            'rental_price_per_day' => 250,
        ]);
        DressFactory::new()->active()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->categoryB->id,
            'rental_price_per_day' => 1000,
        ]);

        $this->get('/catalog?sort=price_asc')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('dresses.0.id', $cheap->id));
    }

    public function test_draft_dress_returns_404_on_storefront(): void
    {
        $draft = DressFactory::new()->draft()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->categoryA->id,
        ]);

        $this->get('/catalog/'.$draft->slug)->assertNotFound();
    }

    public function test_active_dress_detail_renders(): void
    {
        $dress = DressFactory::new()->active()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->categoryA->id,
        ]);
        DressSize::query()->create(['dress_id' => $dress->id, 'size_code' => 'M', 'bust' => 90, 'waist' => 70, 'hips' => 95, 'length' => 150, 'is_available' => true]);

        $this->get('/catalog/'.$dress->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Catalog/Show')
                ->where('dress.id', $dress->id)
                ->where('dress.sizes.0.size_code', 'M'));
    }
}
