<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('bookings:release-unpaid-holds --minutes=30')->everyTenMinutes();
Schedule::command('bookings:auto-resolve-returned --hours=24')->hourly();
