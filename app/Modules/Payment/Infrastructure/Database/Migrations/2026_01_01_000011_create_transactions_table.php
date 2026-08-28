<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('atelier_id')->nullable()->constrained('ateliers')->restrictOnDelete();
            $table->enum('type', ['rental_payment', 'deposit_authorization', 'deposit_capture', 'deposit_release', 'deposit_penalty', 'customer_refund', 'atelier_payout', 'platform_commission', 'tax', 'adjustment']);
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('SAR');
            $table->string('payment_method')->nullable();
            $table->string('gateway_reference')->nullable();
            $table->string('idempotency_key')->unique();
            $table->enum('status', ['initiated', 'authorized', 'captured', 'refunded', 'partially_refunded', 'voided', 'failed'])->default('initiated');
            $table->json('metadata_json')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index('gateway_reference');
            $table->index(['booking_id', 'type']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
