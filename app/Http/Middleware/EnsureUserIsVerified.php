<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Modules\KYC\Domain\Contracts\KycContract;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures renters have approved KYC before high-value booking actions.
 * Platform and atelier roles are exempt.
 */
class EnsureUserIsVerified
{
    public function __construct(private readonly KycContract $kyc) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(403);
        }

        if ($user->role === 'renter' && ! $this->kyc->isUserVerified($user->id)) {
            abort(403, 'Identity verification is required for this action.');
        }

        return $next($request);
    }
}
