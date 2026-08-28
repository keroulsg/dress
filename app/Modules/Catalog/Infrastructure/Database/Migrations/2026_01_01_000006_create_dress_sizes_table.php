<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dress_sizes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('dress_id')->constrained('dresses')->cascadeOnDelete();
            $table->enum('size_code', ['XS', 'S', 'M', 'L', 'XL', '2XL', 'CUSTOM']);
            $table->decimal('bust', 6, 2)->nullable();
            $table->decimal('waist', 6, 2)->nullable();
            $table->decimal('hips', 6, 2)->nullable();
            $table->decimal('length', 6, 2)->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->unique(['dress_id', 'size_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dress_sizes');
    }
};
