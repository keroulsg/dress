<?php

declare(strict_types=1);

namespace App\Modules\Pricing\Domain\ValueObjects;

use App\Modules\Pricing\Domain\Exceptions\InvalidAmountException;
use JsonSerializable;
use Stringable;

/**
 * Immutable, decimal-safe money value object owned by the Pricing module.
 *
 * All financial calculations across the application must pass through this
 * type. Floating point arithmetic is forbidden for monetary values.
 */
final readonly class Money implements JsonSerializable, Stringable
{
    private const SCALE = 4;

    private function __construct(
        private string $amount,
        private string $currency,
    ) {}

    public static function fromDecimal(float|int|string $amount, string $currency): self
    {
        $normalized = number_format((float) $amount, self::SCALE, '.', '');

        if (bccomp($normalized, '0', self::SCALE) < 0) {
            throw new InvalidAmountException('Money amount cannot be negative.');
        }

        if ($currency === '') {
            throw new InvalidAmountException('Currency must not be empty.');
        }

        return new self($normalized, strtoupper($currency));
    }

    public static function fromMinorUnits(int $amount, string $currency): self
    {
        return self::fromDecimal($amount / 100, $currency);
    }

    public static function zero(string $currency): self
    {
        return new self('0.0000', strtoupper($currency));
    }

    public function add(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self(bcadd($this->amount, $other->amount, self::SCALE), $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self(bcsub($this->amount, $other->amount, self::SCALE), $this->currency);
    }

    public function multiply(float|int|string $factor): self
    {
        return new self(bcmul($this->amount, (string) $factor, self::SCALE), $this->currency);
    }

    public function greaterThan(self $other): bool
    {
        $this->assertSameCurrency($other);

        return bccomp($this->amount, $other->amount, self::SCALE) === 1;
    }

    public function greaterThanOrEqual(self $other): bool
    {
        $this->assertSameCurrency($other);

        return bccomp($this->amount, $other->amount, self::SCALE) >= 0;
    }

    public function lessThan(self $other): bool
    {
        $this->assertSameCurrency($other);

        return bccomp($this->amount, $other->amount, self::SCALE) === -1;
    }

    public function isZero(): bool
    {
        return bccomp($this->amount, '0', self::SCALE) === 0;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function amount(): string
    {
        return $this->amount;
    }

    public function toDecimal(): float
    {
        return (float) $this->amount;
    }

    public function toMinorUnits(): int
    {
        return (int) round((float) $this->amount * 100);
    }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidAmountException(
                sprintf('Currency mismatch: %s vs %s.', $this->currency, $other->currency),
            );
        }
    }

    public function jsonSerialize(): array
    {
        return [
            'amount' => rtrim(rtrim($this->amount, '0'), '.'),
            'currency' => $this->currency,
        ];
    }

    public function __toString(): string
    {
        return sprintf('%s %s', $this->currency, rtrim(rtrim($this->amount, '0'), '.'));
    }
}
