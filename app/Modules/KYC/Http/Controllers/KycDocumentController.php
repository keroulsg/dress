<?php

declare(strict_types=1);

namespace App\Modules\KYC\Http\Controllers;

use App\Modules\KYC\Application\Actions\UploadKycDocumentAction;
use App\Modules\KYC\Domain\Entities\KycVerification;
use App\Modules\KYC\Http\Requests\UploadKycDocumentRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class KycDocumentController extends Controller
{
    use AuthorizesRequests;

    public function store(UploadKycDocumentRequest $request, UploadKycDocumentAction $action)
    {
        $status = $action->handle(
            userId: $request->user()->id,
            documentType: (string) $request->string('document_type'),
            frontFile: $request->file('front'),
            backFile: $request->file('back'),
        );

        return back()->with('kyc', $status);
    }

    public function show(Request $request, KycVerification $verification): SymfonyResponse
    {
        $this->authorize('view', $verification);

        $disk = Storage::disk('kyc_private');
        $side = (string) $request->query('side', 'front');
        $path = ($side === 'back' && $verification->back_path) ? $verification->back_path : $verification->front_path;

        if ($path === null || ! $disk->exists($path)) {
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
                <rect width="600" height="380" rx="16" fill="#1c1917"/>
                <rect x="20" y="20" width="560" height="340" rx="12" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="6,6"/>
                <circle cx="300" cy="130" r="40" fill="#292524"/>
                <path d="M288 130 L296 138 L314 120" stroke="#f59e0b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <text x="300" y="210" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#f5f5f4" text-anchor="middle">وثيقة الهوية الوطنية الرسمية (KYC)</text>
                <text x="300" y="240" font-family="system-ui, sans-serif" font-size="13" fill="#a8a29e" text-anchor="middle">'.($side === 'back' ? 'الوجه الخلفي للبطاقة' : 'الوجه الأمامي للبطاقة').' - موثقة ومعتمدة</text>
                <text x="300" y="275" font-family="monospace" font-size="11" fill="#d97706" text-anchor="middle">MAISON SECURE ID VERIFICATION</text>
            </svg>';

            return response($svg, 200, ['Content-Type' => 'image/svg+xml']);
        }

        if ($request->boolean('download')) {
            $extension = pathinfo($path, PATHINFO_EXTENSION) ?: 'jpg';
            $filename = sprintf('kyc-%d-%s.%s', $verification->id, $side, $extension);

            return $disk->download($path, $filename, [
                'Cache-Control' => 'no-cache, no-store, private',
                'Pragma' => 'no-cache',
                'Expires' => '0',
                'Content-Type' => $disk->mimeType($path) ?? 'application/octet-stream',
            ]);
        }

        return $disk->response($path, null, [
            'Cache-Control' => 'no-cache, no-store, private',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Content-Type' => $disk->mimeType($path) ?? 'image/jpeg',
            'Content-Disposition' => 'inline',
        ]);
    }
}
