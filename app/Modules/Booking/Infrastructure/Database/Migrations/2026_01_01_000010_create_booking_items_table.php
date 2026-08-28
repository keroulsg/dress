<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('dress_id')->constrained('dresses')->restrictOnDelete();
            $table->foreignId('dress_size_id')->nullable()->constrained('dress_sizes')->nullOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_rental_price', 10, 2);
            $table->unsignedInteger('rental_days');
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();

            $table->index(['booking_id', 'dress_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_items');
    }
};
