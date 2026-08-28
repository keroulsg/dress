import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';

export default function Home() {
    return (
        <StorefrontLayout>
            <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:py-28">
                <div>
                    <p className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-rose"><Sparkles size={14} aria-hidden="true" /> The atelier edit</p>
                    <h1 className="max-w-3xl font-display text-6xl leading-[0.9] tracking-tight sm:text-8xl">The dress for your <em className="text-rose">next chapter.</em></h1>
                    <p className="mt-8 max-w-lg text-lg leading-8 text-stone-muted">A considered collection of occasionwear, entrusted by independent ateliers and ready for the moments that deserve more.</p>
                    <div className="mt-10 flex flex-wrap items-center gap-5">
                        <button type="button" className="inline-flex items-center gap-3 bg-charcoal px-6 py-4 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-rose">Explore the collection <ArrowUpRight size={16} aria-hidden="true" /></button>
                        <Link href="/foundation" className="text-sm text-stone-muted underline decoration-champagne underline-offset-8">See the architecture</Link>
                    </div>
                </div>
                <div className="relative min-h-[480px] overflow-hidden bg-[#e8ddd5] p-8 sm:min-h-[600px]">
                    <div className="absolute inset-8 border border-white/70" aria-hidden="true" />
                    <div className="flex h-full items-end justify-between bg-gradient-to-t from-[#79635b]/50 to-transparent p-5">
                        <p className="max-w-[12rem] font-display text-4xl leading-none text-white">Made for entrances.</p>
                        <span className="text-xs uppercase tracking-[0.2em] text-white">01 / 04</span>
                    </div>
                </div>
            </section>
            <section id="collections" className="border-y border-stone-line bg-white px-6 py-16 lg:px-10">
                <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-3">
                    {['The ceremony edit', 'After-dark dressing', 'Modern heirlooms'].map((title, index) => (
                        <article key={title} className="border-t border-champagne pt-5">
                            <span className="text-xs text-stone-muted">0{index + 1}</span>
                            <h2 className="mt-10 font-display text-3xl">{title}</h2>
                            <p className="mt-3 text-sm leading-6 text-stone-muted">Curated silhouettes, available for the dates that matter.</p>
                        </article>
                    ))}
                </div>
            </section>
        </StorefrontLayout>
    );
}
