<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->configureRateLimits();
    }

    private function configureRateLimits(): void
    {
        RateLimiter::for('auth', fn (Request $request): Limit => Limit::perMinute(5)
            ->by((string) ($request->user()?->id ?? $request->ip())));

        RateLimiter::for('kyc-upload', fn (Request $request): Limit => Limit::perMinute(3)
            ->by((string) ($request->user()?->id ?? $request->ip())));

        RateLimiter::for('checkout', fn (Request $request): Limit => Limit::perMinute(10)
            ->by((string) ($request->user()?->id ?? $request->ip())));
    }
}
