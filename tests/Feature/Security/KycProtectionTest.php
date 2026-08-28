<?php

declare(strict_types=1);

namespace Tests\Feature\Security;

use App\Modules\Identity\Infrastructure\Database\Factories\UserFactory;
use App\Modules\KYC\Domain\Entities\KycVerification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KycProtectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_stream_kyc_document(): void
    {
        Storage::fake('kyc_private');

        $renter = UserFactory::new()->renter()->create();
        $kyc = KycVerification::query()->create([
            'user_id' => $renter->id,
            'status' => 'approved',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$renter->id.'/national_id/front.jpg',
        ]);

        $this->get(route('kyc.documents.show', $kyc))->assertRedirect(route('login'));
    }

    public function test_non_owner_cannot_stream_kyc_document(): void
    {
        Storage::fake('kyc_private');

        $owner = UserFactory::new()->renter()->create();
        $other = UserFactory::new()->renter()->create();
        $kyc = KycVerification::query()->create([
            'user_id' => $owner->id,
            'status' => 'approved',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$owner->id.'/national_id/front.jpg',
        ]);

        $this->actingAs($other)->get(route('kyc.documents.show', $kyc))->assertForbidden();
    }

    public function test_owner_can_stream_their_own_kyc_document(): void
    {
        Storage::fake('kyc_private');
        Storage::disk('kyc_private')->put('users/1/national_id/front.jpg', 'image-bytes');

        $renter = UserFactory::new()->renter()->create();
        $kyc = KycVerification::query()->create([
            'user_id' => $renter->id,
            'status' => 'approved',
            'document_type' => 'national_id',
            'front_path' => 'users/'.$renter->id.'/national_id/front.jpg',
        ]);

        $this->actingAs($renter)
            ->get(route('kyc.documents.show', $kyc))
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-cache, no-store, private');
    }

    public function test_upload_stores_file_on_private_disk_with_randomized_name(): void
    {
        Storage::fake('kyc_private');
        Storage::fake('public');

        $renter = UserFactory::new()->renter()->create();

        $this->actingAs($renter)
            ->post(route('kyc.documents.store'), [
                'document_type' => 'national_id',
                'front' => UploadedFile::fake()->image('client-original-name.jpg', 600, 800),
            ])
            ->assertSessionHasNoErrors();

        $kyc = KycVerification::query()->latest('id')->first();
        $this->assertNotNull($kyc);
        $this->assertSame('pending', $kyc->status->value);

        $this->assertStringStartsWith('users/', $kyc->front_path);
        $this->assertTrue(Storage::disk('kyc_private')->exists($kyc->front_path));
        $this->assertFalse(Storage::disk('public')->exists($kyc->front_path));
        $this->assertSame([], Storage::disk('public')->allFiles());

        $storedName = basename($kyc->front_path);
        $this->assertMatchesRegularExpression('/^[0-9a-f]{8}-[0-9a-f-]{27}\.jpg$/', $storedName);
        $this->assertStringNotContainsString('client-original-name', $storedName);
    }

    public function test_invalid_mime_is_rejected(): void
    {
        Storage::fake('kyc_private');

        $renter = UserFactory::new()->renter()->create();

        $this->actingAs($renter)
            ->post(route('kyc.documents.store'), [
                'document_type' => 'national_id',
                'front' => UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
            ])
            ->assertInvalid('front');

        $this->assertSame(0, KycVerification::query()->count());
        $this->assertSame([], Storage::disk('kyc_private')->allFiles());
    }
}
