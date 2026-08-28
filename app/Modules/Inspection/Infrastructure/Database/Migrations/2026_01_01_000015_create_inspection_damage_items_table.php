<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspection_damage_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('inspection_report_id')->constrained('inspection_reports')->cascadeOnDelete();
            $table->enum('location', ['chest', 'waist', 'hem', 'zipper', 'train', 'sleeve', 'bodice', 'lining', 'other']);
            $table->enum('damage_type', ['stain', 'tear', 'missing_beads', 'broken_zipper', 'alteration', 'burn', 'water_damage', 'irreparable', 'other']);
            $table->enum('severity', ['minor', 'moderate', 'major', 'critical'])->default('minor');
            $table->text('description')->nullable();
            $table->decimal('repair_cost', 10, 2)->default(0.00);
            $table->decimal('deduction_amount', 10, 2)->default(0.00);
            $table->string('photo_path', 2048)->nullable();
            $table->timestamps();

            $table->index(['inspection_report_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspection_damage_items');
    }
};
