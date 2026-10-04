<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Catalog\Domain\Entities\Category;
use Illuminate\Database\Seeder;

class OccasionsEcosystemSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'فساتين زفاف وسواريه',
                'slug' => 'wedding-evening-gowns',
                'description' => 'أرقى فساتين الهوت كوتور للزفاف والسهرات الملكية الفاخرة للإيجار والشراء.',
                'icon' => 'sparkles',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'عبايات فاخرة وقفاطين',
                'slug' => 'luxury-abayas-kaftans',
                'description' => 'عبايات مطرزة وقفاطين مغربية وخليجية راقية لأرقى المناسبات والاستقبال.',
                'icon' => 'gem',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'مجوهرات وإكسسوارات زفاف',
                'slug' => 'bridal-jewelry-accessories',
                'description' => 'تيجان، أطقم مجوهرات، طرح زفاف، وإكسسوارات شعر متميزة تكمل إطلالتك.',
                'icon' => 'crown',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'حقائب وأحذية سواريه',
                'slug' => 'occasion-bags-shoes',
                'description' => 'كلاتشات سواريه مرصعة وأحذية كعب عالي مصممة للمناسبات الخاصة.',
                'icon' => 'shopping-bag',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'براندات هاند ميد حصرية',
                'slug' => 'handmade-designer-brands',
                'description' => 'قطع وتصميمات يدوية فريدة لمصممات مستقلات للشراء المباشر والتملك.',
                'icon' => 'palette',
                'sort_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::query()->updateOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }
    }
}
