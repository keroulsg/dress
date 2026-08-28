<?php

use App\Modules\Administration\Providers\AdministrationServiceProvider;
use App\Modules\Atelier\Providers\AtelierServiceProvider;
use App\Modules\Availability\Providers\AvailabilityServiceProvider;
use App\Modules\Booking\Providers\BookingServiceProvider;
use App\Modules\Catalog\Providers\CatalogServiceProvider;
use App\Modules\Dispute\Providers\DisputeServiceProvider;
use App\Modules\Finance\Providers\FinanceServiceProvider;
use App\Modules\Identity\Providers\IdentityServiceProvider;
use App\Modules\Inspection\Providers\InspectionServiceProvider;
use App\Modules\Inventory\Providers\InventoryServiceProvider;
use App\Modules\KYC\Providers\KycServiceProvider;
use App\Modules\Media\Providers\MediaServiceProvider;
use App\Modules\Notification\Providers\NotificationServiceProvider;
use App\Modules\Payment\Providers\PaymentServiceProvider;
use App\Modules\Pricing\Providers\PricingServiceProvider;
use App\Modules\Review\Providers\ReviewServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    AdministrationServiceProvider::class,
    AtelierServiceProvider::class,
    AvailabilityServiceProvider::class,
    BookingServiceProvider::class,
    CatalogServiceProvider::class,
    DisputeServiceProvider::class,
    FinanceServiceProvider::class,
    IdentityServiceProvider::class,
    InspectionServiceProvider::class,
    InventoryServiceProvider::class,
    KycServiceProvider::class,
    MediaServiceProvider::class,
    NotificationServiceProvider::class,
    PaymentServiceProvider::class,
    PricingServiceProvider::class,
    ReviewServiceProvider::class,
];
