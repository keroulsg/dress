<?php

declare(strict_types=1);

namespace App\Mail;

use App\Modules\Booking\Domain\Entities\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DepositRefundedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking,
        public readonly float $refundAmount
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم استرداد مبلغ التأمين بنجاح — Maison Rentale | حجز رقم #'.$this->booking->booking_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.deposit-refunded',
            with: [
                'booking' => $this->booking,
                'renter' => $this->booking->renter,
                'atelier' => $this->booking->atelier,
                'refundAmount' => $this->refundAmount,
            ],
        );
    }
}
