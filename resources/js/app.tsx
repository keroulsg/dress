import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { LanguageProvider } from './Contexts/LanguageContext';
import { ThemeProvider } from './Contexts/ThemeContext';

const appName = import.meta.env.VITE_APP_NAME || 'Atelier';

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <LanguageProvider>
                <ThemeProvider>
                    <App {...props} />
                </ThemeProvider>
            </LanguageProvider>
        );
    },
    progress: {
        color: '#9b4b58',
    },
});
