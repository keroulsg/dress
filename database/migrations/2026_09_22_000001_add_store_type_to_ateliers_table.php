<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ateliers', function (Blueprint $table): void {
            if (! Schema::hasColumn('ateliers', 'store_type')) {
                $table->string('store_type', 40)->default('atelier')->after('business_name');
            }
            if (! Schema::hasColumn('ateliers', 'payout_blocked')) {
                $table->boolean('payout_blocked')->default(false)->after('is_active');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ateliers', function (Blueprint $table): void {
            if (Schema::hasColumn('ateliers', 'store_type')) {
                $table->dropColumn('store_type');
            }
            if (Schema::hasColumn('ateliers', 'payout_blocked')) {
                $table->dropColumn('payout_blocked');
            }
        });
    }
};
