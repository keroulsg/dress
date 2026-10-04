<?php

declare(strict_types=1);

namespace App\Modules\Storefront\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Modules\Storefront\Domain\Entities\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wishlist = Wishlist::with(['dress.primaryImage', 'dress.atelier'])
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json(['data' => $wishlist]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dress_id' => 'required|exists:dresses,id',
        ]);

        $userId = $request->user()->id;
        $dressId = $validated['dress_id'];

        $existing = Wishlist::where('user_id', $userId)->where('dress_id', $dressId)->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['status' => 'removed']);
        }

        Wishlist::create([
            'user_id' => $userId,
            'dress_id' => $dressId,
        ]);

        return response()->json(['status' => 'added']);
    }
}
