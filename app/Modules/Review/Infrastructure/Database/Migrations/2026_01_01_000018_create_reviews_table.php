<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('renter_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('dress_id')->constrained('dresses')->restrictOnDelete();
            $table->foreignId('atelier_id')->constrained('ateliers')->restrictOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->text('comment')->nullable();
            $table->text('atelier_reply')->nullable();
            $table->timestamp('atelier_replied_at')->nullable();
            $table->timestamps();

            $table->index(['atelier_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
