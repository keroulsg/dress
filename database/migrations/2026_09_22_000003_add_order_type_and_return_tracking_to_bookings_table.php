<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            if (! Schema::hasColumn('bookings', 'order_type')) {
                $table->string('order_type', 20)->default('rental')->after('status');
            }
            if (! Schema::hasColumn('bookings', 'returned_at')) {
                $table->timestamp('returned_at')->nullable()->after('actual_received_at');
            }
            if (! Schema::hasColumn('bookings', 'deposit_disputed')) {
                $table->boolean('deposit_disputed')->default(false)->after('deposit_deducted');
            }
            if (! Schema::hasColumn('bookings', 'deposit_refunded_at')) {
                $table->timestamp('deposit_refunded_at')->nullable()->after('deposit_disputed');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            if (Schema::hasColumn('bookings', 'order_type')) {
                $table->dropColumn('order_type');
            }
            if (Schema::hasColumn('bookings', 'returned_at')) {
                $table->dropColumn('returned_at');
            }
            if (Schema::hasColumn('bookings', 'deposit_disputed')) {
                $table->dropColumn('deposit_disputed');
            }
            if (Schema::hasColumn('bookings', 'deposit_refunded_at')) {
                $table->dropColumn('deposit_refunded_at');
            }
        });
    }
};
