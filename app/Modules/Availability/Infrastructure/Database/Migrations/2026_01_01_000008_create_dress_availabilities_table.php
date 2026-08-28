<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dress_availabilities', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('dress_id')->constrained('dresses')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('reason', ['rental_hold', 'confirmed_booking', 'fitting', 'in_transit', 'cleaning', 'alteration', 'maintenance', 'manual_block']);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();

            $table->index(['dress_id', 'start_date', 'end_date']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dress_availabilities');
    }
};
