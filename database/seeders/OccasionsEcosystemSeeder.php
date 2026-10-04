<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Catalog\Domain\Entities\Category;
use App\Modules\Catalog\Domain\Entities\Dress;
use App\Modules\Catalog\Domain\Entities\DressImage;
use App\Modules\Catalog\Domain\Entities\DressSize;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OccasionsEcosystemSeeder extends Seeder
{
    public function run(): void
    {
        $categoriesData = [
            [
                'name' => 'فساتين زفاف وسواريه',
                'slug' => 'wedding-evening-gowns',
                'description' => 'أرقى فساتين الهوت كوتور للزفاف والسهرات الملكية الفاخرة للإيجار والشراء.',
                'icon' => 'sparkles',
                'sort_order' => 1,
                'is_active' => true,
                'product_type' => 'dress',
                'items' => [
                    [
                        'title' => 'فستان زفاف ملكي مطرز كريستال سواروفسكي (Royal Swarovski Cathedral Bridal Gown)',
                        'description' => 'فستان زفاف أسطوري بتطريز يدوي فاخر مرصع بالكريستال مع ذيل ملكي بطول 3 أمتار وطرحة مطرزة.',
                        'fabric' => 'French Lace & Silk Tulle',
                        'silhouette' => 'Ball Gown',
                        'color' => 'Ivory White',
                        'retail' => 45000,
                        'rental' => 3500,
                        'deposit' => 1500,
                        'cleaning' => 300,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['S', 'M', 'L'],
                        'images' => [
                            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'فستان سهرة حورية البحر أسود مرصع (Midnight Celestial Mermaid Gown)',
                        'description' => 'إطلالة دراماتيكية ساحرة بقصة حورية البحر الضيقة وتطريز لؤلؤي أسود لامع يبرز القوام بكل فخامة.',
                        'fabric' => 'Crepe Silk & Micro Sequin',
                        'silhouette' => 'Mermaid',
                        'color' => 'Midnight Black',
                        'retail' => 22000,
                        'rental' => 1800,
                        'deposit' => 800,
                        'cleaning' => 200,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['XS', 'S', 'M'],
                        'images' => [
                            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'فستان خطوبة ملكي زمردي مطرز بالذهب (Emerald Royale Gala Gown)',
                        'description' => 'فستان سهرة وخطوبة باللون الأخضر الزمردي الفاخر مع تطريز خيوط حريرية وذهبية فاخرة مستوحاة من العصور الذهبية.',
                        'fabric' => 'Duchess Satin & Zari Thread',
                        'silhouette' => 'A-line',
                        'color' => 'Emerald Green',
                        'retail' => 28000,
                        'rental' => 2200,
                        'deposit' => 1000,
                        'cleaning' => 250,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['S', 'M', 'L', 'XL'],
                        'images' => [
                            'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'فستان سندريلا كوتور وردي بودري (Blush Pink Couture Fairy Gown)',
                        'description' => 'فستان حالم بطبقات التول الإيطالي مع كورسيه مبطن ومطرز بأوراق الشجر ثلاثية الأبعاد.',
                        'fabric' => 'Italian Tulle & Organza',
                        'silhouette' => 'Princess',
                        'color' => 'Dusty Rose',
                        'retail' => 32000,
                        'rental' => 2600,
                        'deposit' => 1200,
                        'cleaning' => 250,
                        'allows_rent' => true,
                        'allows_sale' => false,
                        'mode' => 'rent',
                        'sizes' => ['S', 'M', 'L'],
                        'images' => [
                            'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'عبايات فاخرة وقفاطين',
                'slug' => 'luxury-abayas-kaftans',
                'description' => 'عبايات مطرزة وقفاطين مغربية وخليجية راقية لأرقى المناسبات والاستقبال.',
                'icon' => 'gem',
                'sort_order' => 2,
                'is_active' => true,
                'product_type' => 'abaya',
                'items' => [
                    [
                        'title' => 'قفطان مغربي ملكي مطرز بالصقلي الذهبي (Imperial Gold Embroidered Moroccan Kaftan)',
                        'description' => 'قفطان مخملي ملكي مكون من قطعتين مع حزام مضلع مطلي بالذهب ومطرز بخيوط الصقلي الحر والعقيق.',
                        'fabric' => 'Pure Silk Velvet & Skalli Gold',
                        'silhouette' => 'Two-Piece Kaftan',
                        'color' => 'Royal Burgundy',
                        'retail' => 25000,
                        'rental' => 1900,
                        'deposit' => 900,
                        'cleaning' => 200,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM', 'M', 'L'],
                        'images' => [
                            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'عباية استقبال حرير مطرزة يدوياً باللؤلؤ (Hand-Embroidered Pearl Silk Abaya)',
                        'description' => 'عباية استقبال راقية من الحرير الطبيعي الياباني مع أكمام درابيه وشك يدوي من حبات اللؤلؤ الطبيعي.',
                        'fabric' => 'Japanese Crepe & Natural Pearls',
                        'silhouette' => 'Cape Abaya',
                        'color' => 'Champagne Beige',
                        'retail' => 14000,
                        'rental' => 1200,
                        'deposit' => 600,
                        'cleaning' => 150,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['M', 'L', 'XL'],
                        'images' => [
                            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'قفطان سواريه فيروزي بتطريز زردوزي (Turquoise Royal Gala Kaftan)',
                        'description' => 'قفطان سواريه استثنائي باللون الفيروزي الملكي مع كاب طويل شفاف وتطريز هندسي مذهل.',
                        'fabric' => 'Silk Chiffon & Metallic Thread',
                        'silhouette' => 'Cape Gown Kaftan',
                        'color' => 'Turquoise Blue',
                        'retail' => 19500,
                        'rental' => 1600,
                        'deposit' => 700,
                        'cleaning' => 180,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['S', 'M', 'L'],
                        'images' => [
                            'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'مجوهرات وإكسسوارات زفاف',
                'slug' => 'bridal-jewelry-accessories',
                'description' => 'تيجان، أطقم مجوهرات، طرح زفاف، وإكسسوارات شعر متميزة تكمل إطلالتك.',
                'icon' => 'crown',
                'sort_order' => 3,
                'is_active' => true,
                'product_type' => 'jewelry',
                'items' => [
                    [
                        'title' => 'تاج زفاف ملكي مرصع بالزركون السويسري (Imperial Swiss Zircon Bridal Tiara)',
                        'description' => 'تاج عالي البريق مطلي بالروديوم الأبيض ومرصع بأحجار الزركون الفاخرة المقطوعة بدقة الماس.',
                        'fabric' => 'Rhodium Plated Brass & AAA Zircons',
                        'silhouette' => 'High Crown Tiara',
                        'color' => 'Platinum Silver',
                        'retail' => 12000,
                        'rental' => 950,
                        'deposit' => 500,
                        'cleaning' => 80,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM'],
                        'images' => [
                            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'طقم مجوهرات سواريه مطلي ذهب أبيض (Luminescent Bridal Necklace & Earrings Set)',
                        'description' => 'طقم فخم يضم عقداً متدلياً وأقراطاً ملكية متناسقة مصممة خصيصاً لإبراز فتحة الرقبة والأكتاف في فساتين السهرة.',
                        'fabric' => 'White Gold Plating & Crystal Gems',
                        'silhouette' => 'Collar Necklace & Drop Earrings',
                        'color' => 'Brilliant Silver',
                        'retail' => 16000,
                        'rental' => 1100,
                        'deposit' => 600,
                        'cleaning' => 100,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM'],
                        'images' => [
                            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'طرحة زفاف فرنسية ملكية مطرزة بالدانتيل (Cathedral French Lace Bridal Veil)',
                        'description' => 'طرحة زفاف كاتدرائية بطول 3.5 متر من التول الحريري فائق النعومة والمزين بأطراف دانتيل شانتيلي الفرنسي.',
                        'fabric' => 'Silk Illusion Tulle & Chantilly Lace',
                        'silhouette' => 'Cathedral 3.5m',
                        'color' => 'Ivory',
                        'retail' => 8500,
                        'rental' => 700,
                        'deposit' => 350,
                        'cleaning' => 90,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM'],
                        'images' => [
                            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'حقائب وأحذية مناسبات',
                'slug' => 'occasion-bags-shoes',
                'description' => 'كلاتشات سواريه مرصعة وأحذية كعب عالي مصممة للمناسبات الخاصة.',
                'icon' => 'shopping-bag',
                'sort_order' => 4,
                'is_active' => true,
                'product_type' => 'shoes',
                'items' => [
                    [
                        'title' => 'كلاتش سواريه مرصع بالكريستال الذهبي (Golden Crystal Minaudière Clutch)',
                        'description' => 'حقيبة يد صلبة للمناسبات مرصعة بالكامل بكريستالات براقة مع قفل ماسي وسلسلة كتف رفيعة قابلة للإزالة.',
                        'fabric' => 'Metallic Hardcase & Austrian Crystals',
                        'silhouette' => 'Minaudière Clutch',
                        'color' => 'Champagne Gold',
                        'retail' => 7500,
                        'rental' => 650,
                        'deposit' => 300,
                        'cleaning' => 70,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM'],
                        'images' => [
                            'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'حذاء زفاف وسهرة ستان كعب عالي مع بروش لؤلؤ (Silk Satin Bridal Stiletto with Pearl Buckle)',
                        'description' => 'حذاء كعب عالي أنيق ومريح مبطن بنعل داخلي مريح من الجلد الإيطالي مع بروش كريستالي أمامي فخم.',
                        'fabric' => 'Duchess Silk Satin & Italian Leather',
                        'silhouette' => 'Pointed Toe 9cm Stiletto',
                        'color' => 'Off-White Ivory',
                        'retail' => 9200,
                        'rental' => 750,
                        'deposit' => 400,
                        'cleaning' => 80,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM', 'S', 'M', 'L'],
                        'images' => [
                            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1518049362301-316223405371?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'حقيبة سهرة مخملية خضراء مطرزة يدوي (Velvet Baroque Evening Bag)',
                        'description' => 'حقيبة سهرة مخملية أنيقة بتطريزات باروكية راقية وقفل ذهبي كلاسيكي.',
                        'fabric' => 'Italian Velvet & Brass Details',
                        'silhouette' => 'Shoulder & Handbag',
                        'color' => 'Emerald Green',
                        'retail' => 6800,
                        'rental' => 550,
                        'deposit' => 250,
                        'cleaning' => 60,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM'],
                        'images' => [
                            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'براندات هاند ميد حصرية',
                'slug' => 'handmade-designer-brands',
                'description' => 'قطع وتصميمات يدوية فريدة لمصممات مستقلات للشراء المباشر والتملك.',
                'icon' => 'palette',
                'sort_order' => 5,
                'is_active' => true,
                'product_type' => 'couture',
                'items' => [
                    [
                        'title' => 'فستان كوتور بتطريز زهور ثلاثية الأبعاد (Handmade 3D Floral Applique Couture Gown)',
                        'description' => 'قطعة فنية حصرية مصنوعة يدوياً بالكامل بحرفية أكثر من 120 ساعة عمل وتطريز زهور حريرية مجسمة.',
                        'fabric' => 'Silk Organza & Hand-Cut Petals',
                        'silhouette' => 'Asymmetric High-Low',
                        'color' => 'Lavender Dream',
                        'retail' => 38000,
                        'rental' => 2900,
                        'deposit' => 1400,
                        'cleaning' => 300,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['S', 'M'],
                        'images' => [
                            'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'كاب سواريه هاند ميد مهدب بالريش واللؤلؤ (Artisanal Feather & Pearl Evening Cape)',
                        'description' => 'كاب سهرة فاخر يرتدى فوق الفساتين البسيطة ليحولها إلى إطلالة كوتور متفردة بتطريز ريش النعام والخرز الزجاجي.',
                        'fabric' => 'Fine Tulle, Ostrich Feathers & Glass Beads',
                        'silhouette' => 'Floor Length Cape',
                        'color' => 'Pearl White',
                        'retail' => 18000,
                        'rental' => 1500,
                        'deposit' => 700,
                        'cleaning' => 200,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['CUSTOM'],
                        'images' => [
                            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                    [
                        'title' => 'فستان كورسيه درابيه حرير طبيعي (Draped Mulberry Silk Sculptural Gown)',
                        'description' => 'تصميم يدوي انسيابي يعانق القوام بحرير التوت الطبيعي 100% مع كورسيه داخلي صلب منحوت يدوياً.',
                        'fabric' => '100% Mulberry Silk Charmeuse',
                        'silhouette' => 'Sculptural Column',
                        'color' => 'Bronze Gold',
                        'retail' => 31000,
                        'rental' => 2400,
                        'deposit' => 1100,
                        'cleaning' => 250,
                        'allows_rent' => true,
                        'allows_sale' => true,
                        'mode' => 'both',
                        'sizes' => ['XS', 'S', 'M', 'L'],
                        'images' => [
                            'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800',
                            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
                        ],
                    ],
                ],
            ],
        ];

        $ateliers = Atelier::query()->orderBy('id')->get();
        if ($ateliers->isEmpty()) {
            return;
        }

        $globalCounter = 100;

        foreach ($categoriesData as $catData) {
            $items = $catData['items'];
            unset($catData['items']);

            $productType = $catData['product_type'] ?? 'dress';
            unset($catData['product_type']);

            $category = Category::query()->updateOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );

            foreach ($items as $itemIndex => $item) {
                $globalCounter++;
                $atelier = $ateliers[$globalCounter % $ateliers->count()];
                $slug = Str::slug($item['title']).'-'.$category->id.'-'.$globalCounter;

                $dress = Dress::query()->updateOrCreate(
                    ['slug' => $slug],
                    [
                        'atelier_id' => $atelier->id,
                        'category_id' => $category->id,
                        'title' => $item['title'],
                        'sku' => 'ECO-'.strtoupper(substr($category->slug, 0, 3)).'-'.str_pad((string) $globalCounter, 4, '0', STR_PAD_LEFT),
                        'description' => $item['description'],
                        'fabric_type' => $item['fabric'],
                        'silhouette' => $item['silhouette'],
                        'color_primary' => $item['color'],
                        'original_retail_value' => $item['retail'],
                        'rental_price_per_day' => $item['rental'],
                        'security_deposit_amount' => $item['deposit'],
                        'cleaning_fee' => $item['cleaning'],
                        'late_fee_per_day' => round($item['rental'] * 0.3, 2),
                        'turnaround_buffer_days' => 2,
                        'condition_rating' => 'brand_new',
                        'status' => 'active',
                        'product_type' => $productType,
                        'listing_mode' => $item['mode'] ?? 'both',
                        'allows_rent' => $item['allows_rent'] ?? true,
                        'allows_sale' => $item['allows_sale'] ?? true,
                        'rating_average' => 4.9,
                        'rating_count' => rand(6, 25),
                        'published_at' => now()->subDays(rand(1, 15)),
                    ]
                );

                // Add sizes
                DressSize::query()->where('dress_id', $dress->id)->delete();
                foreach ($item['sizes'] as $sizeCode) {
                    DressSize::query()->create([
                        'dress_id' => $dress->id,
                        'size_code' => $sizeCode,
                        'bust' => 90,
                        'waist' => 72,
                        'hips' => 98,
                        'length' => 150,
                        'is_available' => true,
                    ]);
                }

                // Add images
                DressImage::query()->where('dress_id', $dress->id)->delete();
                foreach ($item['images'] as $imgIndex => $imgUrl) {
                    DressImage::query()->create([
                        'dress_id' => $dress->id,
                        'image_path' => $imgUrl,
                        'thumbnail_path' => $imgUrl,
                        'display_order' => $imgIndex + 1,
                        'is_primary' => $imgIndex === 0,
                        'alt_text' => $dress->title,
                    ]);
                }
            }
        }
    }
}
