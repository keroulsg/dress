import StorefrontLayout from '../Layouts/StorefrontLayout';

export default function Foundation() {
    return (
        <StorefrontLayout>
            <section className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
                <p className="text-xs uppercase tracking-[0.28em] text-rose">Phase 1 foundation</p>
                <h1 className="mt-5 font-display text-6xl leading-none">A considered foundation.</h1>
                <p className="mt-8 max-w-2xl text-lg leading-8 text-stone-muted">The platform is being built as one Laravel application with explicit business modules, protected contracts, and an editorial storefront.</p>
                <div className="mt-12 grid gap-4 sm:grid-cols-2">
                    {['Modular monolith boundaries', 'Inertia and React 19', 'Design tokens and RTL-ready typography', 'Sixteen registered business modules'].map((item) => (
                        <div key={item} className="border border-stone-line bg-white p-6 text-sm">{item}</div>
                    ))}
                </div>
            </section>
        </StorefrontLayout>
    );
}
