<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dresses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('atelier_id')->constrained('ateliers')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->longText('description')->nullable();
            $table->string('fabric_type')->nullable();
            $table->string('silhouette')->nullable();
            $table->string('color_primary')->nullable();
            $table->decimal('original_retail_value', 10, 2);
            $table->decimal('rental_price_per_day', 10, 2);
            $table->decimal('security_deposit_amount', 10, 2);
            $table->decimal('cleaning_fee', 10, 2)->default(0.00);
            $table->decimal('late_fee_per_day', 10, 2);
            $table->unsignedInteger('turnaround_buffer_days')->default(2);
            $table->enum('condition_rating', ['brand_new', 'like_new', 'good', 'minor_flaws'])->default('good');
            $table->enum('status', ['draft', 'active', 'rented', 'reserved', 'maintenance', 'cleaning', 'alteration', 'retired'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'rental_price_per_day']);
            $table->index(['atelier_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dresses');
    }
};
