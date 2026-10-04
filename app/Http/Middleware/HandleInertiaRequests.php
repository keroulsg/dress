<?php

namespace App\Http\Middleware;

use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'atelier_id' => $user->ateliers()->first()?->id ?? $user->staffMemberships()->first()?->atelier_id,
                ] : null,
            ],
            'platform_settings' => [
                'vat_enabled' => (bool) PlatformSetting::get('vat_enabled', false),
                'vat_rate' => (float) PlatformSetting::get('vat_rate', 0.14),
            ],
        ];
    }
}
