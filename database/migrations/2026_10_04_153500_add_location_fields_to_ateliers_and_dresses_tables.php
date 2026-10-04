<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ateliers', function (Blueprint $table): void {
            if (! Schema::hasColumn('ateliers', 'governorate')) {
                $table->string('governorate', 100)->nullable()->after('city');
            }
        });

        Schema::table('dresses', function (Blueprint $table): void {
            if (! Schema::hasColumn('dresses', 'governorate')) {
                $table->string('governorate', 100)->nullable()->after('color_primary');
            }
            if (! Schema::hasColumn('dresses', 'city')) {
                $table->string('city', 100)->nullable()->after('governorate');
            }
            if (! Schema::hasColumn('dresses', 'available_for_intercity_shipping')) {
                $table->boolean('available_for_intercity_shipping')->default(true)->after('city');
            }
        });

        // Seed realistic Egyptian locations for existing ateliers
        DB::table('ateliers')->where('id', 1)->update([
            'governorate' => 'Cairo',
            'city' => 'New Cairo',
        ]);
        DB::table('ateliers')->where('id', 2)->update([
            'governorate' => 'Alexandria',
            'city' => 'Smouha',
        ]);
        DB::table('ateliers')->where('id', 3)->update([
            'governorate' => 'Gharbia',
            'city' => 'Tanta',
        ]);

        // Any remaining ateliers without governorate
        DB::table('ateliers')->whereNull('governorate')->update([
            'governorate' => 'Cairo',
            'city' => 'Zamalek',
        ]);
    }

    public function down(): void
    {
        Schema::table('dresses', function (Blueprint $table): void {
            $table->dropColumn(['governorate', 'city', 'available_for_intercity_shipping']);
        });

        Schema::table('ateliers', function (Blueprint $table): void {
            $table->dropColumn(['governorate']);
        });
    }
};
