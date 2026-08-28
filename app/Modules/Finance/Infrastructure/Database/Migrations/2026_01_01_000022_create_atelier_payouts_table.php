<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('atelier_payouts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('atelier_id')->constrained('ateliers')->restrictOnDelete();
            $table->string('payout_key')->unique();
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('SAR');
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['atelier_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('atelier_payouts');
    }
};
