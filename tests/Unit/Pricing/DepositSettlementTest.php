<?php

declare(strict_types=1);

namespace Tests\Unit\Pricing;

use App\Modules\Pricing\Domain\Contracts\PricingContract;
use App\Modules\Pricing\Domain\ValueObjects\Money;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepositSettlementTest extends TestCase
{
    use RefreshDatabase;

    public function test_clean_return_refunds_full_deposit(): void
    {
        $settlement = app(PricingContract::class)->calculateDepositDeduction(
            Money::fromDecimal(2000, 'EGP'),
            Money::fromDecimal(0, 'EGP'),
            Money::fromDecimal(0, 'EGP'),
        );

        $this->assertSame('0.0000', $settlement->damageDeduction->amount());
        $this->assertSame('0.0000', $settlement->lateFeeDeduction->amount());
        $this->assertSame('2000.0000', $settlement->netRefundableAmount->amount());
    }

    public function test_damage_exceeding_deposit_deducts_full_deposit_and_never_negative_refund(): void
    {
        $settlement = app(PricingContract::class)->calculateDepositDeduction(
            Money::fromDecimal(2000, 'EGP'),
            Money::fromDecimal(5000, 'EGP'),
            Money::fromDecimal(0, 'EGP'),
        );

        $this->assertSame('2000.0000', $settlement->damageDeduction->amount());
        $this->assertSame('0.0000', $settlement->netRefundableAmount->amount());
    }

    public function test_partial_damage_and_late_fee_deducted_from_held_deposit(): void
    {
        $settlement = app(PricingContract::class)->calculateDepositDeduction(
            Money::fromDecimal(2000, 'EGP'),
            Money::fromDecimal(500, 'EGP'),
            Money::fromDecimal(300, 'EGP'),
        );

        $this->assertSame('500.0000', $settlement->damageDeduction->amount());
        $this->assertSame('300.0000', $settlement->lateFeeDeduction->amount());
        $this->assertSame('1200.0000', $settlement->netRefundableAmount->amount());
    }

    public function test_combined_deductions_cannot_exceed_deposit(): void
    {
        $settlement = app(PricingContract::class)->calculateDepositDeduction(
            Money::fromDecimal(1000, 'EGP'),
            Money::fromDecimal(800, 'EGP'),
            Money::fromDecimal(800, 'EGP'),
        );

        // damage takes 800, late fee takes remaining 200.
        $this->assertSame('800.0000', $settlement->damageDeduction->amount());
        $this->assertSame('200.0000', $settlement->lateFeeDeduction->amount());
        $this->assertSame('0.0000', $settlement->netRefundableAmount->amount());
    }
}
