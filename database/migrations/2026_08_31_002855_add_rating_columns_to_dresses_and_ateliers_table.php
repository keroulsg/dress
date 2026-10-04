<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dresses', function (Blueprint $table) {
            $table->decimal('rating_average', 3, 2)->default(5.00);
            $table->unsignedInteger('rating_count')->default(0);
        });

        Schema::table('ateliers', function (Blueprint $table) {
            $table->decimal('rating_average', 3, 2)->default(5.00);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dresses', function (Blueprint $table) {
            $table->dropColumn(['rating_average', 'rating_count']);
        });

        Schema::table('ateliers', function (Blueprint $table) {
            $table->dropColumn('rating_average');
        });
    }
};
