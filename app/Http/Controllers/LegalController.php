<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function terms(): Response
    {
        return Inertia::render('Legal/Terms', [
            'updated_at' => '2026-09-22',
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('Legal/Privacy', [
            'updated_at' => '2026-09-22',
        ]);
    }
}
