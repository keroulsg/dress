<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain\Enums;

enum EgyptianGovernorate: string
{
    case Cairo = 'Cairo';
    case Giza = 'Giza';
    case Alexandria = 'Alexandria';
    case Gharbia = 'Gharbia';
    case Dakahlia = 'Dakahlia';
    case Qalyubia = 'Qalyubia';
    case Sharqia = 'Sharqia';
    case Monufia = 'Monufia';
    case Beheira = 'Beheira';
    case KafrElSheikh = 'Kafr El Sheikh';
    case Damietta = 'Damietta';
    case PortSaid = 'Port Said';
    case Ismailia = 'Ismailia';
    case Suez = 'Suez';
    case Fayoum = 'Fayoum';
    case BeniSuef = 'Beni Suef';
    case Minya = 'Minya';
    case Asyut = 'Asyut';
    case Sohag = 'Sohag';
    case Qena = 'Qena';
    case Luxor = 'Luxor';
    case Aswan = 'Aswan';
    case RedSea = 'Red Sea';
    case SouthSinai = 'South Sinai';
    case NorthSinai = 'North Sinai';
    case Matrouh = 'Matrouh';
    case NewValley = 'New Valley';

    public function label(string $locale = 'ar'): string
    {
        if ($locale === 'en') {
            return $this->value;
        }

        return match ($this) {
            self::Cairo => 'القاهرة',
            self::Giza => 'الجيزة',
            self::Alexandria => 'الإسكندرية',
            self::Gharbia => 'الغربية',
            self::Dakahlia => 'الدقهلية',
            self::Qalyubia => 'القليوبية',
            self::Sharqia => 'الشرقية',
            self::Monufia => 'المنوفية',
            self::Beheira => 'البحيرة',
            self::KafrElSheikh => 'كفر الشيخ',
            self::Damietta => 'دمياط',
            self::PortSaid => 'بورسعيد',
            self::Ismailia => 'الإسماعيلية',
            self::Suez => 'السويس',
            self::Fayoum => 'الفيوم',
            self::BeniSuef => 'بني سويف',
            self::Minya => 'المنيا',
            self::Asyut => 'أسيوط',
            self::Sohag => 'سوهاج',
            self::Qena => 'قنا',
            self::Luxor => 'الأقصر',
            self::Aswan => 'أسوان',
            self::RedSea => 'البحر الأحمر',
            self::SouthSinai => 'جنوب سيناء',
            self::NorthSinai => 'شمال سيناء',
            self::Matrouh => 'مطروح',
            self::NewValley => 'الوادي الجديد',
        };
    }

    /**
     * @return array<int, array{value: string, name_ar: string, name_en: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $case): array => [
            'value' => $case->value,
            'name_ar' => $case->label('ar'),
            'name_en' => $case->label('en'),
        ], self::cases());
    }

    /**
     * Try to match a governorate by English value or Arabic label.
     */
    public static function normalize(string $input): ?string
    {
        $trimmed = trim($input);
        foreach (self::cases() as $case) {
            if (strcasecmp($case->value, $trimmed) === 0 || $case->label('ar') === $trimmed) {
                return $case->value;
            }
        }

        return null;
    }
}
