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
            if (! Schema::hasColumn('dresses', 'product_type')) {
                $table->string('product_type', 40)->default('dress')->after('category_id');
            }
            if (! Schema::hasColumn('dresses', 'allows_rent')) {
                $table->boolean('allows_rent')->default(true)->after('listing_mode');
            }
            if (! Schema::hasColumn('dresses', 'allows_sale')) {
                $table->boolean('allows_sale')->default(false)->after('allows_rent');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dresses', function (Blueprint $table): void {
            if (Schema::hasColumn('dresses', 'product_type')) {
                $table->dropColumn('product_type');
            }
            if (Schema::hasColumn('dresses', 'allows_rent')) {
                $table->dropColumn('allows_rent');
            }
            if (Schema::hasColumn('dresses', 'allows_sale')) {
                $table->dropColumn('allows_sale');
            }
        });
    }
};
