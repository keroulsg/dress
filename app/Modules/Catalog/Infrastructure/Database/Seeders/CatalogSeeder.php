<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Infrastructure\Database\Seeders;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressImage;
use App\Modules\Catalog\Domain\Entities\DressSize;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [];

        $categoryDefinitions = [
            ['name' => 'Evening Soirée', 'slug' => 'evening-soiree', 'icon' => 'sparkles'],
            ['name' => 'Bridal', 'slug' => 'bridal', 'icon' => 'gem'],
            ['name' => 'Engagement', 'slug' => 'engagement', 'icon' => 'heart'],
            ['name' => 'Vintage Couture', 'slug' => 'vintage-couture', 'icon' => 'archive'],
        ];

        foreach ($categoryDefinitions as $definition) {
            $categories[] = Category::query()->create([
                ...$definition,
                'description' => fake()->sentence(),
                'sort_order' => count($categories),
                'is_active' => true,
            ]);
        }

        $ateliers = Atelier::query()->orderBy('id')->get();
        $silhouettes = ['A-line', 'Mermaid', 'Ball Gown', 'Sheath', 'Empire Waist', 'Column'];
        $fabrics = ['Silk Chiffon', 'Lace', 'Tulle', 'Satin', 'Organza', 'Mikado'];
        $colors = ['Ivory', 'Champagne', 'Dusty Rose', 'Charcoal', 'Blush', 'Emerald', 'Midnight Blue'];

        $dressTitles = [
            'Celestial Gown', 'Midnight Bloom', 'Rosewater Dream', 'Golden Hour', 'Velvet Nocturne',
            'Aurelia Gown', 'Ivory Cascade', 'Scarlet Symphony', 'Garden Affair', 'Ethereal Muse',
            'Champagne Toast', 'Moonlit Lace', 'Whisper of Silk', 'Royal Velvet', 'Enchanted Garden',
            'Sapphire Evening', 'Opaline Beauty', 'Classic Couture', 'Dream Weaver', 'Regal Elegance',
        ];

        foreach ($dressTitles as $index => $title) {
            $atelier = $ateliers[$index % $ateliers->count()];
            $category = $categories[$index % count($categories)];
            $slug = Str::slug($title);

            $dress = Dress::query()->create([
                'atelier_id' => $atelier->id,
                'category_id' => $category->id,
                'title' => $title,
                'slug' => $slug.'-'.($index + 1),
                'sku' => 'DR-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'description' => fake()->paragraph(3),
                'fabric_type' => $fabrics[$index % count($fabrics)],
                'silhouette' => $silhouettes[$index % count($silhouettes)],
                'color_primary' => $colors[$index % count($colors)],
                'original_retail_value' => fake()->randomFloat(2, 4000, 18000),
                'rental_price_per_day' => fake()->randomFloat(2, 250, 1200),
                'security_deposit_amount' => fake()->randomFloat(2, 800, 3000),
                'cleaning_fee' => fake()->randomFloat(2, 80, 250),
                'late_fee_per_day' => fake()->randomFloat(2, 100, 300),
                'turnaround_buffer_days' => 2,
                'condition_rating' => ['brand_new', 'like_new', 'good', 'minor_flaws'][$index % 4],
                'status' => 'active',
                'published_at' => now()->subDays(rand(1, 20)),
            ]);

            $this->seedSizes($dress);
            $this->seedImages($dress);
        }

        $this->command?->info('Catalog seeded: '.count($categories).' categories, 20 luxury dresses with sizes and images.');
    }

    private function seedSizes(Dress $dress): void
    {
        $sizeCodes = collect(['XS', 'S', 'M', 'L', 'XL', '2XL'])->random(rand(3, 5));

        foreach ($sizeCodes as $sizeCode) {
            $base = 82 + match ($sizeCode) {
                'XS' => 0,
                'S' => 4,
                'M' => 8,
                'L' => 12,
                default => 16,
            };

            DressSize::query()->create([
                'dress_id' => $dress->id,
                'size_code' => $sizeCode,
                'bust' => $base,
                'waist' => $base - 12,
                'hips' => $base + 6,
                'length' => 145 + rand(0, 30),
                'is_available' => true,
            ]);
        }
    }

    private function seedImages(Dress $dress): void
    {
        $count = rand(2, 3);

        for ($i = 1; $i <= $count; $i++) {
            DressImage::query()->create([
                'dress_id' => $dress->id,
                'image_path' => "dresses/{$dress->slug}/{$i}.webp",
                'thumbnail_path' => "dresses/{$dress->slug}/thumb-{$i}.webp",
                'display_order' => $i,
                'is_primary' => $i === 1,
                'alt_text' => $dress->title.' — view '.$i,
            ]);
        }
    }
}
