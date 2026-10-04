<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class PlatformSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get a setting value with default fallback and caching.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("platform_setting:{$key}", 3600, function () use ($key, $default) {
            $setting = static::query()->where('key', $key)->first();
            if (! $setting || $setting->value === null) {
                return $default;
            }

            $decoded = json_decode($setting->value, true);

            return $decoded !== null ? $decoded : $setting->value;
        });
    }

    /**
     * Set a setting value and clear its cache.
     */
    public static function set(string $key, mixed $value): void
    {
        $payload = is_array($value) || is_bool($value) || is_numeric($value)
            ? json_encode($value)
            : (string) $value;

        static::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $payload]
        );

        Cache::forget("platform_setting:{$key}");
    }
}
