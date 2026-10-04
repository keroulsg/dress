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

class BookingConfirmedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Booking $booking
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تأكيد حجزك الملكي — Maison Rentale | حجز رقم #'.$this->booking->booking_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-confirmed',
            with: [
                'booking' => $this->booking,
                'renter' => $this->booking->renter,
                'atelier' => $this->booking->atelier,
                'items' => $this->booking->items,
            ],
        );
    }
}
