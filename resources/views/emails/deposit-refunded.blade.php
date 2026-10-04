<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>استرداد مبلغ التأمين — Maison Rentale</title>
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
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 14px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .refund-amount {
            font-size: 28px;
            font-weight: bold;
            color: #15803d;
            margin: 10px 0;
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
            <div class="badge">✓ تم تحرير واسترداد التأمين بنجاح</div>
        </div>

        <div class="content">
            <h2 style="font-size: 18px; color: #1c1917; margin-top: 0;">
                مرحباً {{ $renter?->name ?? 'عميلتنا العزيزة' }}،
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #44403c;">
                يسعدنا إعلامك بأنه تم فحص القطعة المسترجعة بنجاح والتأكد من سلامتها بواسطة أتيليه <strong>{{ $atelier?->business_name ?? 'الأتيليه' }}</strong>، وتم تحرير واسترداد مبلغ التأمين بالكامل لحسابك.
            </p>

            <div class="info-card">
                <span style="font-size: 13px; color: #166534;">المبلغ المسترد لحسابك:</span>
                <div class="refund-amount">{{ number_format((float)$refundAmount, 2) }} ج.م</div>
                <span style="font-size: 12px; color: #15803d;">مرتبط بحجز رقم #{{ $booking->booking_number }}</span>
            </div>

            <p style="font-size: 13px; color: #57534e; text-align: center; margin-top: 20px;">
                نشكركِ على ثقتكِ في Maison Rentale ونتطلع لخدمتكِ دائماً في أرقى مناسباتك القادمة. ✨
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0;">Maison Rentale — التميز والأمان في عالم أزياء المناسبات</p>
        </div>
    </div>
</body>
</html>
