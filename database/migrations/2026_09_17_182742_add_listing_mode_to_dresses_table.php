<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dresses', function (Blueprint $table): void {
            $table->string('listing_mode', 20)->default('rent')->after('condition_rating');
        });
    }

    public function down(): void
    {
        Schema::table('dresses', function (Blueprint $table): void {
            $table->dropColumn('listing_mode');
        });
    }
};
