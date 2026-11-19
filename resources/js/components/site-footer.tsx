import AppLogoIcon from '@/components/app-logo-icon';
import { formatMetres } from '@/lib/format';
import type { ClosingPhoto } from '@/types/trek';
import { Link } from '@inertiajs/react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

// three.js is large, so the 3D dot bust is loaded only when the footer needs it.
const DotBust = lazy(() => import('@/components/dot-bust'));

/*
 * Footer. On the home page it gets a trek photo and becomes the closing section,
 * adapted from the MotionSites "Northstar" design: a big call to action over the
 * photo and a frosted footer pane at the bottom. Elsewhere it is a plain forest-green
 * footer with the same links. The entrance runs once when it first scrolls into view.
 */

const columns = [
    {
        title: 'Treks',
        links: [
            { label: 'Beginner treks', href: '/treks?level=beginner' },
            { label: 'Intermediate treks', href: '/treks?level=intermediate' },
            { label: 'Expert treks', href: '/treks?level=expert' },
            { label: 'All treks', href: '/treks' },
        ],
    },
    {
        title: 'Plan',
        links: [
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Altitude sickness guide', href: '/safety/altitude-sickness' },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'Log in', href: '/login' },
            { label: 'Register as a trekker', href: '/register' },
            { label: 'Register as a guide', href: '/register' },
        ],
    },
];

/*
 * Quote band at the top of the footer, with the glowing 3D dot portrait beside the quote.
 * The portrait is built from the photo at public/images/quote-portrait.png
 * (a PNG with the background removed works best). If the photo is missing, the box stays empty.
 */
const footerQuote = {
    text: 'Giving up is not in my blood, sir.',
    author: 'Nirmal Purja (Nimsdai)',
    role: 'Mountaineer',
    image: '/images/quote-portrait.png',
};

function QuoteBand() {
    // Mount the 3D bust (and download three.js) only when the footer gets near the screen.
    const ref = useRef<HTMLElement>(null);
    const [near, setNear] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setNear(true);
                    io.disconnect();
                }
            },
            { rootMargin: '600px 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const box = 'aspect-[5/6] w-full max-w-[300px] shrink-0 md:w-[300px]';

    return (
        <figure
            ref={ref}
            data-reveal className="flex flex-col gap-8 border-b border-white/25 pb-10 md:flex-row md:items-center md:gap-12" style={{ animationDelay: '500ms' }}>
            {near ? (
                <Suspense fallback={<div className={box} />}>
                    <DotBust image={footerQuote.image} className={box} label={`Dot portrait of ${footerQuote.author}`} />
                </Suspense>
            ) : (
                <div className={box} />
            )}
            <div className="min-w-0 flex-1">
                <blockquote className="font-display text-[clamp(1.75rem,3vw,3rem)] leading-[1.1] font-semibold text-balance text-white xl:whitespace-nowrap">
                    <p>&ldquo;{footerQuote.text}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-4 text-[15px] text-white/80">
                    <span className="font-semibold text-white">{footerQuote.author}</span>, {footerQuote.role.toLowerCase()}
                </figcaption>
            </div>
        </figure>
    );
}

function useRevealOnce<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
        // Hide only once JS is running, so content is never stuck invisible.
        el.classList.add('tm-armed');
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('tm-in');
                    io.disconnect();
                }
            },
            { threshold: 0.25 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return ref;
}

function FooterBody({ onPhoto }: { onPhoto: boolean }) {
    const muted = onPhoto ? 'text-white/75' : 'text-white/80';
    return (
        <div className="mx-auto max-w-[1400px] px-5 pt-10 pb-8 sm:px-8">
            <QuoteBand />
            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.6fr]">
                <div data-reveal style={{ animationDelay: '600ms' }}>
                    <Link href="/" className="inline-flex items-center gap-2 rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                        <AppLogoIcon className="h-7 w-7 fill-current text-white" />
                        <span className="font-display text-xl font-semibold text-white">TrekMitra</span>
                    </Link>
                    <p className={`mt-3 max-w-xs text-sm leading-relaxed ${muted}`}>
                        Find the right trek, the right people and a trusted guide, and book it all at once.
                    </p>
                </div>

                <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    {columns.map((col, i) => (
                        <div key={col.title} data-reveal style={{ animationDelay: `${720 + i * 70}ms` }}>
                            <h2 className="text-sm font-semibold tracking-[0.08em] text-white/85 uppercase">{col.title}</h2>
                            <ul className="mt-3 space-y-1">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="inline-block rounded-[4px] py-1 text-[15px] text-white transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            <div data-rule className="mt-10 h-px bg-white/40" style={{ animationDelay: '980ms' }} />
            <p data-reveal className={`mt-5 text-sm ${muted}`} style={{ animationDelay: '1120ms' }}>
                © {new Date().getFullYear()} TrekMitra
            </p>
        </div>
    );
}

export default function SiteFooter({ closing }: { closing?: ClosingPhoto | null }) {
    const ref = useRevealOnce<HTMLElement>();

    if (!closing) {
        return (
            <footer className="bg-forest text-white">
                <FooterBody onPhoto={false} />
            </footer>
        );
    }

    return (
        <footer ref={ref} aria-labelledby="closing-title" className="tm-reveal relative isolate flex min-h-[760px] flex-col overflow-hidden bg-charcoal text-white md:min-h-[820px]">
            <img src={closing.photo_url} alt={`${closing.trek_name}, ${closing.state}`} className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center]" />
            {/* Darken the top for the headline, as in the original. */}
            <div className="absolute inset-x-0 top-0 -z-10 h-[60%] bg-linear-to-b from-[rgba(11,61,59,0.55)] via-[rgba(11,61,59,0.25)] to-transparent" aria-hidden="true" />

            <div className="mx-auto w-full max-w-[1400px] px-5 pt-20 sm:px-8 md:pt-28">
                <p data-reveal className="text-sm font-semibold tracking-[0.16em] uppercase" style={{ animationDelay: '60ms' }}>
                    Ready when you are
                </p>
                <div className="tm-mask mt-4">
                    <h2 id="closing-title" data-headline className="font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.02em]" style={{ animationDelay: '170ms' }}>
                        Your next trail starts here
                    </h2>
                </div>
                <p data-reveal className="mt-5 max-w-md text-lg leading-relaxed text-white/95" style={{ animationDelay: '430ms' }}>
                    Pick a trek for your level, choose who you go with, and pay once for the package, transport and guide.
                </p>
                <div data-reveal style={{ animationDelay: '620ms' }}>
                    <Link
                        href="/treks"
                        className="mt-8 inline-flex h-12 items-center rounded-full bg-sunrise px-7 font-semibold text-forest transition-colors hover:bg-sunrise-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Find a trek
                    </Link>
                </div>
            </div>

            <Link
                href={`/treks/${closing.slug}`}
                className="mx-auto mt-6 mb-6 w-full max-w-[1400px] px-5 text-right text-sm text-white/85 hover:underline hover:underline-offset-4 sm:px-8"
            >
                {closing.trek_name}, {closing.state} · {formatMetres(closing.max_altitude_m)}
            </Link>

            {/* Frosted footer pane */}
            <div className="mt-auto border-t border-white/20 bg-[rgba(11,61,59,0.78)] backdrop-blur-[40px] backdrop-saturate-[0.85]">
                <FooterBody onPhoto />
            </div>
        </footer>
    );
}
