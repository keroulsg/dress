<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('atelier_staff', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('atelier_id')->constrained('ateliers')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['manager', 'inventory_manager', 'inspector', 'staff'])->default('staff');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['atelier_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('atelier_staff');
    }
};
