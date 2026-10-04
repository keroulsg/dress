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
        Schema::table('disputes', function (Blueprint $table) {
            $table->foreignId('arbitrator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('arbitration_status')->nullable();
            $table->text('arbitration_resolution')->nullable();
            $table->decimal('resolution_amount', 10, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disputes', function (Blueprint $table) {
            $table->dropForeign(['arbitrator_id']);
            $table->dropColumn([
                'arbitrator_id',
                'arbitration_status',
                'arbitration_resolution',
                'resolution_amount',
            ]);
        });
    }
};
