<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->string('booking_reference', 32)->unique();
            $table->foreignId('renter_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('atelier_id')->constrained('ateliers')->restrictOnDelete();
            $table->timestamp('fitting_datetime')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamp('actual_dispatched_at')->nullable();
            $table->timestamp('actual_received_at')->nullable();
            $table->timestamp('actual_returned_at')->nullable();
            $table->unsignedInteger('rental_days_count');
            $table->decimal('rental_rate_total', 10, 2);
            $table->decimal('cleaning_fee_total', 10, 2)->default(0.00);
            $table->decimal('security_deposit_amount', 10, 2);
            $table->decimal('late_fee_total', 10, 2)->default(0.00);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('tax_amount', 10, 2)->default(0.00);
            $table->decimal('grand_total', 10, 2);
            $table->decimal('deposit_held', 10, 2)->default(0.00);
            $table->decimal('deposit_refunded', 10, 2)->default(0.00);
            $table->decimal('deposit_deducted', 10, 2)->default(0.00);
            $table->char('currency', 3)->default('SAR');
            $table->enum('status', ['pending_payment', 'confirmed', 'fitting_scheduled', 'ready_for_dispatch', 'dispatched', 'in_customer_possession', 'returned_pending_inspection', 'inspection_completed', 'completed', 'disputed', 'cancelled', 'expired'])->default('pending_payment');
            $table->string('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index(['start_date', 'end_date']);
            $table->index(['atelier_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
