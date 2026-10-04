<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Modules\Atelier\Domain\Entities\Atelier;
use App\Modules\Identity\Domain\Entities\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'nullable|string|max:30',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|string|in:renter,atelier_owner',
            'business_name' => 'nullable|string|max:255',
            'store_type' => 'nullable|string|in:bridal_atelier,fashion_boutique,abaya_designer,accessories_brand,occasions_hub',
            'agree_to_terms' => 'nullable|boolean',
        ]);

        $role = $request->input('role', 'renter') === 'atelier_owner' ? 'atelier_owner' : 'renter';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);

        event(new Registered($user));

        Auth::login($user);

        if ($role === 'atelier_owner') {
            $businessName = $request->input('business_name') ?: ($user->name.' Atelier');
            $atelier = Atelier::create([
                'owner_user_id' => $user->id,
                'business_name' => $businessName,
                'slug' => Str::slug($businessName).'-'.Str::random(5),
                'license_number' => 'LIC-'.strtoupper(Str::random(8)),
                'store_type' => $request->input('store_type', 'bridal_atelier') ?: 'bridal_atelier',
                'commission_rate' => 0.15,
                'is_active' => true,
                'approved_at' => now(),
            ]);

            return redirect()->to("/atelier/{$atelier->id}/dresses");
        }

        return redirect()->to('/catalog');
    }
}
