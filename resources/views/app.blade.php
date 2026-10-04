<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'Atelier') }}</title>

        <!-- Fonts -->
        @routes
        @viteReactRefresh
        <script>
            (function() {
                try {
                    var theme = localStorage.getItem('maison_theme');
                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.colorScheme = 'dark';
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                    }
                    var locale = localStorage.getItem('maison_locale') || 'ar';
                    document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
                    document.documentElement.setAttribute('lang', locale);
                } catch (e) {}
            })();
        </script>

        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
