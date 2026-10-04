<?php

declare(strict_types=1);

namespace Tests\Feature\Catalog;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocationFilterTest extends TestCase
{
    use RefreshDatabase;

    private Atelier $cairoAtelier;

    private Atelier $gharbiaAtelier;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $user1 = UserFactory::new()->atelierOwner()->create();
        $user2 = UserFactory::new()->atelierOwner()->create();

        $this->cairoAtelier = AtelierFactory::new()->approved()->create([
            'owner_user_id' => $user1->id,
            'governorate' => 'Cairo',
            'city' => 'New Cairo',
        ]);

        $this->gharbiaAtelier = AtelierFactory::new()->approved()->create([
            'owner_user_id' => $user2->id,
            'governorate' => 'Gharbia',
            'city' => 'Tanta',
        ]);

        $this->category = CategoryFactory::new()->create([
            'name' => 'Evening Soirée',
            'slug' => 'evening-soiree',
        ]);
    }

    public function test_catalog_filters_by_explicit_dress_governorate(): void
    {
        $cairoDress = DressFactory::new()->active()->create([
            'atelier_id' => $this->cairoAtelier->id,
            'category_id' => $this->category->id,
            'governorate' => 'Cairo',
            'city' => 'Nasr City',
        ]);

        $alexDress = DressFactory::new()->active()->create([
            'atelier_id' => $this->cairoAtelier->id,
            'category_id' => $this->category->id,
            'governorate' => 'Alexandria',
            'city' => 'Smouha',
        ]);

        $this->get('/catalog?governorate=Cairo')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/Catalog')
                ->where('dresses.total', 1)
                ->where('dresses.data.0.id', $cairoDress->id));

        $this->get('/catalog?governorate=Alexandria')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/Catalog')
                ->where('dresses.total', 1)
                ->where('dresses.data.0.id', $alexDress->id));
    }

    public function test_catalog_filters_by_atelier_governorate_when_dress_governorate_is_null(): void
    {
        $inheritedGharbiaDress = DressFactory::new()->active()->create([
            'atelier_id' => $this->gharbiaAtelier->id,
            'category_id' => $this->category->id,
            'governorate' => null,
            'city' => null,
        ]);

        $cairoDress = DressFactory::new()->active()->create([
            'atelier_id' => $this->cairoAtelier->id,
            'category_id' => $this->category->id,
            'governorate' => 'Cairo',
            'city' => 'New Cairo',
        ]);

        $this->get('/catalog?governorate=Gharbia')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/Catalog')
                ->where('dresses.total', 1)
                ->where('dresses.data.0.id', $inheritedGharbiaDress->id));
    }

    public function test_catalog_can_filter_using_arabic_governorate_name(): void
    {
        $alexDress = DressFactory::new()->active()->create([
            'atelier_id' => $this->cairoAtelier->id,
            'category_id' => $this->category->id,
            'governorate' => 'Alexandria',
            'city' => 'Roushdy',
        ]);

        $cairoDress = DressFactory::new()->active()->create([
            'atelier_id' => $this->cairoAtelier->id,
            'category_id' => $this->category->id,
            'governorate' => 'Cairo',
            'city' => 'Zamalek',
        ]);

        // "الإسكندرية" normalizes to "Alexandria"
        $this->get('/catalog?governorate='.urlencode('الإسكندرية'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('dresses.total', 1)
                ->where('dresses.data.0.id', $alexDress->id));
    }

    public function test_dress_show_contains_location_and_intercity_shipping_fields(): void
    {
        $dress = DressFactory::new()->active()->create([
            'atelier_id' => $this->gharbiaAtelier->id,
            'category_id' => $this->category->id,
            'governorate' => 'Gharbia',
            'city' => 'Tanta',
            'available_for_intercity_shipping' => true,
        ]);

        $this->get('/dresses/'.$dress->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Storefront/DressShow')
                ->where('dress.governorate', 'Gharbia')
                ->where('dress.city', 'Tanta')
                ->where('dress.available_for_intercity_shipping', true));
    }
}
