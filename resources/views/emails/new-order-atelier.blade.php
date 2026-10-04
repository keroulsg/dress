<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلب جديد — Maison Rentale</title>
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
            padding: 30px 25px;
            text-align: center;
            color: #fef3c7;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
        }
        .badge {
            display: inline-block;
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            border: 1px solid #10b981;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 12px;
            margin-top: 10px;
            font-weight: bold;
        }
        .content {
            padding: 30px 25px;
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
        .btn-action {
            display: inline-block;
            background-color: #b45309;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 14px;
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
        <div class="header">
            <h1>Maison <span style="color: #fbbf24;">Rentale</span></h1>
            <div class="badge">🔔 إشعار طلب مؤكد جديد لأتيليهكِ</div>
        </div>

        <div class="content">
            <h2 style="font-size: 18px; color: #1c1917; margin-top: 0;">
                مرحباً أتيليه {{ $atelier?->business_name ?? 'الموقر' }}،
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
                تم استلام وتأكيد طلب جديد بنجاح عبر المنصة مع دفع العربون الإلكتروني. يرجى تجهيز القطعة لموعد الاستلام.
            </p>

            <div class="info-card">
                <div class="info-row">
                    <span style="color: #78716c;">رقم الطلب:</span>
                    <strong>#{{ $booking->booking_number }}</strong>
                </div>
                <div class="info-row">
                    <span style="color: #78716c;">نوع المعاملة:</span>
                    <strong>{{ $booking->order_type === 'sale' ? 'شراء وتملك فوري' : 'تأجير مناسبات' }}</strong>
                </div>
                <div class="info-row">
                    <span style="color: #78716c;">اسم العميلة:</span>
                    <strong>{{ $renter?->name ?? 'عميلة المنصة' }}</strong>
                </div>
                <div class="info-row">
                    <span style="color: #78716c;">هاتف العميلة:</span>
                    <strong dir="ltr">{{ $renter?->phone ?? 'مسجل بالملف' }}</strong>
                </div>
                <div class="info-row">
                    <span style="color: #78716c;">فترة الحجز / الاستلام:</span>
                    <strong>{{ \Carbon\Carbon::parse($booking->start_date)->format('Y/m/d') }}</strong>
                </div>
                <div class="info-row">
                    <span style="color: #78716c;">إجمالي الطلب:</span>
                    <strong>{{ number_format((float)$booking->total_amount, 2) }} ج.م</strong>
                </div>
                <div class="info-row">
                    <span style="color: #15803d;">المتبقي للتحصيل نقداً عند التسليم:</span>
                    <strong style="color: #15803d;">{{ number_format((float)($booking->total_amount * 0.90), 2) }} ج.م</strong>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ url('/atelier/' . ($atelier?->id ?? 1) . '/bookings') }}" class="btn-action" target="_blank">
                    عرض تفاصيل الحجز وتوثيق الهوية KYC ➔
                </a>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0;">بوابة الأتيليه والمصممين — Maison Rentale Studio</p>
        </div>
    </div>
</body>
</html>
