<?php

declare(strict_types=1);

namespace Tests\Feature\Catalog;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Atelier\Infrastructure\Database\Factories\AtelierFactory;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Infrastructure\Database\Factories\CategoryFactory;
use App\Modules\Catalog\Infrastructure\Database\Factories\DressFactory;
use App\Modules\Identity\Domain\Entities\User;
use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Domain\Enums\KycStatus;
use App\Modules\Storefront\Application\Services\StorefrontSearchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MultiCategoryProductTest extends TestCase
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
        $this->atelier = AtelierFactory::new()->approved()->create([
            'owner_user_id' => $this->owner->id,
            'store_type' => 'abaya_designer',
        ]);
        $this->category = CategoryFactory::new()->create([
            'name' => 'Luxury Abayas & Kaftans',
            'slug' => 'luxury-abayas-kaftans',
        ]);
    }

    public function test_atelier_can_create_abaya_product_with_sale_mode(): void
    {
        $response = $this->actingAs($this->owner)->post(
            route('atelier.dresses.store', $this->atelier),
            [
                'title' => 'Royal Emerald Velvet Kaftan',
                'category_id' => $this->category->id,
                'product_type' => 'abaya',
                'listing_mode' => 'sell',
                'description' => 'Exquisite handcrafted velvet kaftan with gold embroidery.',
                'original_retail_value' => 7500,
                'sizes' => [
                    ['size_code' => 'M'],
                ],
                'publish_now' => true,
            ]
        );

        $response->assertRedirect(route('atelier.dresses.index', $this->atelier));

        $this->assertDatabaseHas('dresses', [
            'title' => 'Royal Emerald Velvet Kaftan',
            'product_type' => 'abaya',
            'listing_mode' => 'sell',
            'allows_rent' => false,
            'allows_sale' => true,
            'status' => 'active',
        ]);
    }

    public function test_storefront_search_filters_by_product_type_and_mode(): void
    {
        DressFactory::new()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->category->id,
            'title' => 'Silk Kaftan For Sale',
            'product_type' => 'abaya',
            'allows_rent' => false,
            'allows_sale' => true,
            'status' => 'active',
        ]);

        DressFactory::new()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->category->id,
            'title' => 'Bridal Gown For Rent',
            'product_type' => 'dress',
            'allows_rent' => true,
            'allows_sale' => false,
            'status' => 'active',
        ]);

        $searchService = app(StorefrontSearchService::class);

        $abayaResults = $searchService->search(['product_type' => 'abaya']);
        $this->assertCount(1, $abayaResults->items());
        $this->assertSame('Silk Kaftan For Sale', $abayaResults->items()[0]->title);

        $saleResults = $searchService->search(['mode' => 'sale']);
        $this->assertCount(1, $saleResults->items());
        $this->assertSame('Silk Kaftan For Sale', $saleResults->items()[0]->title);

        $rentResults = $searchService->search(['mode' => 'rent']);
        $this->assertCount(1, $rentResults->items());
        $this->assertSame('Bridal Gown For Rent', $rentResults->items()[0]->title);
    }

    public function test_direct_sale_checkout_creates_booking_with_zero_deposit(): void
    {
        $renter = UserFactory::new()->renter()->create();

        KycVerification::query()->create([
            'user_id' => $renter->id,
            'status' => KycStatus::Approved,
            'document_type' => 'national_id',
            'front_path' => 'kyc/front.jpg',
            'back_path' => 'kyc/back.jpg',
        ]);

        $dress = DressFactory::new()->create([
            'atelier_id' => $this->atelier->id,
            'category_id' => $this->category->id,
            'title' => 'Exclusive Diamond Tiara',
            'product_type' => 'accessory',
            'allows_rent' => false,
            'allows_sale' => true,
            'original_retail_value' => 5000,
            'rental_price_per_day' => 0,
            'security_deposit_amount' => 0,
            'cleaning_fee' => 0,
            'status' => 'active',
        ]);

        $response = $this->actingAs($renter)->post(
            route('checkout.store', ['dress' => $dress->id]),
            [
                'dress_id' => $dress->id,
                'order_type' => 'direct_sale',
                'delivery_address' => '10 Nile Corniche, Maadi, Cairo',
                'phone' => '01012345678',
                'notes' => 'Deliver in gift box',
                'client_token' => 'test-sale-uuid-1234',
                'agree_to_terms' => true,
            ]
        );

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'order_type' => 'direct_sale',
            'renter_id' => $renter->id,
            'atelier_id' => $this->atelier->id,
            'security_deposit_amount' => '0.00',
        ]);
    }
}
