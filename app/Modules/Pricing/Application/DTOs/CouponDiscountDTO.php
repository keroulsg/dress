<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Application\DTOs;

use App\Modules\Pricing\Domain\ValueObjects\Money;

/**
 * Validated coupon discount preview.
 */
final readonly class CouponDiscountDTO
{
    public function __construct(
        public string $code,
        public string $discountType,
        public Money $discountAmount,
        public Money $subtotal,
        public string $currency,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'code' => $this->code,
            'discount_type' => $this->discountType,
            'discount_amount' => $this->discountAmount->jsonSerialize(),
            'subtotal' => $this->subtotal->jsonSerialize(),
            'currency' => $this->currency,
        ];
    }
}
