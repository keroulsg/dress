<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد الحجز — Maison Rentale</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Tajawal';
            background-color: #f5f5f4;
            margin: 0;
            padding: 0;
            direction: rtl;
            color: #1c1917;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e7e5e4;
        }
        .header {
            background-color: #1c1917;
            padding: 35px 25px;
            text-align: center;
            color: #fef3c7;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .badge {
            display: inline-block;
            background: rgba(217, 119, 6, 0.2);
            color: #f59e0b;
            border: 1px solid #d97706;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
        }
        .content {
            padding: 30px 25px;
        }
        .greeting {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #1c1917;
        }
        .info-card {
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 14px;
            padding: 18px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #e7e5e4;
            font-size: 14px;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .financial-box {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 14px;
            padding: 16px;
            margin: 20px 0;
        }
        .qr-pass {
            text-align: center;
            background: #1c1917;
            color: #ffffff;
            border-radius: 16px;
            padding: 22px;
            margin: 25px 0;
        }
        .qr-pass h3 {
            margin: 0 0 6px 0;
            color: #fbbf24;
            font-size: 16px;
        }
        .qr-code-box {
            display: inline-block;
            background: #ffffff;
            color: #1c1917;
            padding: 12px 24px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 3px;
            margin: 12px 0;
            border: 2px dashed #fbbf24;
        }
        .btn-whatsapp {
            display: inline-block;
            background-color: #25d366;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 26px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
            margin-top: 15px;
            text-align: center;
        }
        .footer {
            background-color: #fafaf9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #78716c;
            border-top: 1px solid #e7e5e4;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Maison <span style="color: #fbbf24;">Rentale</span></h1>
            <div class="badge">تم تأكيد الحجز الملكي بنجاح ✨</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">مرحباً {{ $renter?->name ?? 'عميلتنا العزيزة' }}،</div>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
                يسعدنا إبلاغكِ بأنه تم استلام وتأكيد طلبك بنجاح، وتم حجز القطعة حصرياً لمناسبتك الخاصة.
            </p>

            <!-- Booking Summary -->
            <div class="info-card">
                <div class="info-row">
                    <span style="color: #78716c;">رقم الحجز:</span>
                    <strong>#{{ $booking->booking_number }}</strong>
                </div>
                <div class="info-row">
                    <span style="color: #78716c;">نوع الطلب:</span>
                    <strong>{{ $booking->order_type === 'sale' ? 'شراء وتملك فوري' : 'إيجار مناسبات فاخر' }}</strong>
                </div>
                <div class="info-row">
                    <span style="color: #78716c;">تاريخ الاستلام والبداية:</span>
                    <strong>{{ \Carbon\Carbon::parse($booking->start_date)->format('Y/m/d') }}</strong>
                </div>
                @if($booking->order_type !== 'sale')
                <div class="info-row">
                    <span style="color: #78716c;">تاريخ الإرجاع المقرر:</span>
                    <strong>{{ \Carbon\Carbon::parse($booking->end_date)->format('Y/m/d') }}</strong>
                </div>
                @endif
                <div class="info-row">
                    <span style="color: #78716c;">الأتيليه المضيف:</span>
                    <strong>{{ $atelier?->business_name ?? 'الأتيليه الملكي' }}</strong>
                </div>
            </div>

            <!-- Financial Split Breakdown -->
            <div class="financial-box">
                <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 15px;">تفاصيل السداد والتقسيم المالي:</h4>
                <div class="info-row" style="border-color: #fde68a;">
                    <span>إجمالي قيمة الحجز:</span>
                    <strong>{{ number_format((float)$booking->total_amount, 2) }} ج.م</strong>
                </div>
                <div class="info-row" style="border-color: #fde68a;">
                    <span style="color: #15803d;">العربون الإلكتروني المدفوع (10%):</span>
                    <strong style="color: #15803d;">{{ number_format((float)($booking->paid_amount ?? ($booking->total_amount * 0.10)), 2) }} ج.م (تم الدفع)</strong>
                </div>
                <div class="info-row" style="border-color: #fde68a;">
                    <span style="color: #b45309;">المتبقي للدفع نقداً بالأتيليه (90%):</span>
                    <strong style="color: #b45309;">{{ number_format((float)($booking->total_amount * 0.90), 2) }} ج.م</strong>
                </div>
                @if($booking->order_type !== 'sale')
                <div class="info-row" style="border-color: #fde68a;">
                    <span>مبلغ التأمين المسترد (عند الاستلام):</span>
                    <span>مسترد بالكامل خلال 24 ساعة من الفحص</span>
                </div>
                @endif
            </div>

            <!-- In-Atelier QR Pass -->
            <div class="qr-pass">
                <h3>بطاقة الاستلام الرقمية (In-Atelier Pass)</h3>
                <p style="font-size: 12px; color: #d6d3d1; margin: 4px 0 12px 0;">
                    يرجى إبراز هذا الكود لصاحبة الأتيليه عند موعد الاستلام لتأكيد هويتك وتسليم القطعة:
                </p>
                <div class="qr-code-box">
                    PASS-{{ strtoupper(substr(md5((string)$booking->id), 0, 8)) }}
                </div>
            </div>

            <!-- Atelier Contact -->
            <div style="text-align: center; margin: 25px 0;">
                <p style="font-size: 13px; color: #57534e; margin-bottom: 8px;">
                    عنوان الأتيليه: {{ $atelier?->address ?? 'شارع التسعين، التجمع الخامس، القاهرة' }}
                </p>
                @php
                    $waNumber = preg_replace('/[^0-9]/', '', (string)($atelier?->whatsapp_number ?? '201000000000'));
                @endphp
                <a href="https://wa.me/{{ $waNumber }}?text={{ urlencode('مرحباً، أود الاستفسار عن حجزي رقم #' . $booking->booking_number) }}" class="btn-whatsapp" target="_blank">
                    تواصل واتساب مع الأتيليه 💬
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 6px 0;">Maison Rentale — المنصة الرائدة لتأجير وشراء فساتين الهوت كوتور والزفاف</p>
            <p style="margin: 0; color: #a8a29e;">خدمة العملاء متوفرة على مدار الساعة لمساعدتك في كل خطوة.</p>
        </div>
    </div>
</body>
</html>
