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

        if ($user === null) {
            abort(403);
        }

        $value = $request->route($routeParam);
        $atelierId = $value instanceof Model ? (int) $value->getKey() : (int) $value;

        if ($atelierId <= 0) {
            abort(403);
        }

        if ($user->isSuperadmin()) {
            return $next($request);
        }

        $owned = $this->ateliers->findForOwner($user->id);

        if ($owned !== null && $owned->atelierId === $atelierId) {
            return $next($request);
        }

        if ($this->ateliers->isStaff($atelierId, $user->id)) {
            return $next($request);
        }

        abort(403);
    }
}
