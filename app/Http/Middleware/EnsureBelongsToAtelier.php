<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Modules\Atelier\Domain\Contracts\AtelierReader;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforces tenant scope on /atelier/* routes. A user may only operate within
 * an atelier they own or where they hold an active staff membership. Fails
 * closed: an unknown or cross-tenant atelier id yields 403.
 */
class EnsureBelongsToAtelier
{
    public function __construct(private readonly AtelierReader $ateliers) {}

    public function handle(Request $request, Closure $next, string $routeParam = 'atelier'): Response
    {
        $user = $request->user();

        // Condition 1: User MUST be authenticated
        if ($user === null) {
            return redirect()->guest(route('login'));
        }

        // Condition 2: User role MUST strictly be atelier_owner, atelier_staff, or super_admin
        if ($user->role !== 'atelier_owner' && $user->role !== 'atelier_staff' && ! $user->isSuperadmin()) {
            abort(403, 'غير مصرح لك بالوصول. لوحة التحكم مخصصة لصاحبة الأتيليه فقط.');
        }

        $value = $request->route($routeParam);
        $atelierId = $value instanceof Model ? (int) $value->getKey() : (int) $value;

        if ($atelierId <= 0) {
            abort(403, 'غير مصرح لك بالوصول. لوحة التحكم مخصصة لصاحبة الأتيليه فقط.');
        }

        // Superadmin bypass
        if ($user->isSuperadmin()) {
            return $next($request);
        }

        // Condition 3 (Strict Tenant Isolation): User must own or be staff of this specific atelier
        $owned = $this->ateliers->findForOwner($user->id);

        if ($owned !== null && $owned->atelierId === $atelierId) {
            return $next($request);
        }

        if ($this->ateliers->isStaff($atelierId, $user->id)) {
            return $next($request);
        }

        abort(403, 'غير مصرح لك بالوصول. لوحة التحكم مخصصة لصاحبة الأتيليه فقط.');
    }
}
