<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspection_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('inspector_id')->constrained('users')->restrictOnDelete();
            $table->enum('phase', ['pre_dispatch', 'post_return']);
            $table->enum('condition_summary', ['perfect', 'normal_wear', 'stain_repairable', 'torn_repairable', 'total_loss'])->default('normal_wear');
            $table->text('damage_description')->nullable();
            $table->decimal('recommended_deposit_deduction', 10, 2)->default(0.00);
            $table->decimal('approved_deposit_deduction', 10, 2)->default(0.00);
            $table->boolean('customer_approved')->default(false);
            $table->timestamp('customer_approved_at')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'phase']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspection_reports');
    }
};
