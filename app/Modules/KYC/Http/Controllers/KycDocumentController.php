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
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function show(Request $request, KycVerification $verification): StreamedResponse
    {
        $this->authorize('view', $verification);

        $disk = Storage::disk('kyc_private');

        if (! $disk->exists($verification->front_path)) {
            abort(404);
        }

        return $disk->download($verification->front_path, null, [
            'Cache-Control' => 'no-cache, no-store, private',
            'Pragma' => 'no-cache',
            'Expires' => '0',
            'Content-Type' => $disk->mimeType($verification->front_path) ?? 'application/octet-stream',
        ]);
    }
}
