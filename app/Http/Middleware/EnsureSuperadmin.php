<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperadmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->guest(route('login'))->with('status', 'يجب تسجيل الدخول بحساب مدير المنصة للوصول إلى لوحة التحكم المركزية.');
        }

        if (! $user->isSuperadmin()) {

            $currentRoleText = match ($user->role) {
                'atelier_owner' => 'صاحبة أتيليه (Atelier Owner)',
                'atelier_staff' => 'طاقم عمل أتيليه (Atelier Staff)',
                'renter' => 'عميلة / مستأجرة (Customer)',
                default => (string) $user->role,
            };

            abort(403, "غير مصرح لك بالوصول. أنت مسجل حالياً بحساب ({$user->email} - {$currentRoleText}). للوصول إلى لوحة الإدارة المركزية وتوثيق الهويات يجب تسجيل الدخول بحساب مدير المنصة (admin@dress.test).");
        }

        return $next($request);
    }
}
