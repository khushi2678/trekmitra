import SearchBar from '@/components/search-bar';
import { formatMetres } from '@/lib/format';
import type { HomeHero as HomeHeroData } from '@/types/trek';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/*
 * Home hero, adapted from the MotionSites "Wander Far" layout:
 * big headline + lede, an Airbnb-style search bar, wide photo panel with a location chip.
 * Entrance animation lives in app.css (.tm-rise). Photo never animates; only an
 * optional video moves, and only when the user has not asked for reduced motion.
 */

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(true);
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(query.matches);
        const onChange = () => setReduced(query.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);
    return reduced;
}

export default function HomeHero({ hero, cities }: { hero: HomeHeroData | null; cities: string[] }) {
    const reducedMotion = usePrefersReducedMotion();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoReady, setVideoReady] = useState(false);

    return (
        <section aria-labelledby="hero-title" className="bg-page">
            <div className="mx-auto max-w-[1400px] px-5 pt-10 sm:px-8 md:pt-16">
                {/* Headline + lede */}
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-end">
                    <h1 id="hero-title" className="font-display text-[clamp(2.75rem,5.6vw,6rem)] lg:whitespace-nowrap leading-[0.98] font-semibold tracking-[-0.03em] text-charcoal">
                        <span className="tm-rise block" style={{ animationDelay: '0ms' }}>
                            Find your trail.
                        </span>
                        <span className="tm-rise block" style={{ animationDelay: '140ms' }}>
                            Trek it together.
                        </span>
                    </h1>
                    <p className="tm-rise max-w-md text-lg leading-relaxed text-slate md:justify-self-end md:text-right" style={{ animationDelay: '320ms' }}>
                        The right trek for your level, the right people and a trusted guide, booked and paid in one place.
                    </p>
                </div>

                <div className="tm-rise mt-10 flex justify-center" style={{ animationDelay: '480ms' }}>
                    <SearchBar cities={cities} />
                </div>
            </div>

            {/* Photo panel */}
            {hero && (
                <div className="relative mx-auto mt-8 max-w-[1400px] px-5 pb-8 sm:px-8 md:pb-12">
                    <div
                        className="relative h-[clamp(260px,52vh,620px)] overflow-hidden rounded-[6px] bg-charcoal"
                    >
                        <img
                            src={hero.photo_url}
                            alt={`${hero.trek_name}, ${hero.state}`}
                            className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-center"
                        />
                        {hero.video_url && !reducedMotion && (
                            <video
                                ref={videoRef}
                                src={hero.video_url}
                                poster={hero.photo_url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                aria-hidden="true"
                                onLoadedData={() => setVideoReady(true)}
                                className={`absolute inset-0 h-full w-full object-cover object-[70%_center] transition-opacity duration-700 md:object-center ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                            />
                        )}

                        <Link
                            href={`/treks/${hero.slug}`}
                            className={`absolute left-4 inline-flex items-baseline bottom-4 gap-3 rounded-[4px] bg-surface px-3.5 py-2 text-sm hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                        >
                            <span className="font-semibold text-charcoal">
                                {hero.trek_name}, {hero.state}
                            </span>
                            <span className="text-slate tabular-nums">{formatMetres(hero.max_altitude_m)}</span>
                        </Link>
                    </div>

                </div>
            )}
        </section>
    );
}
