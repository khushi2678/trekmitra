import HomeHero from '@/components/home-hero';
import TrekRow from '@/components/trek-row';
import PublicLayout from '@/layouts/public-layout';
import { formatDayRange, formatMetres, levelLabels } from '@/lib/format';
import type { HomePageProps, Level, LevelSummary } from '@/types/trek';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';

const levelLines: Record<Level, string> = {
    beginner: 'Short treks on clear trails. A good place to start if you are new to trekking.',
    intermediate: 'Longer days, steeper climbs and some overnight routes. Some trekking experience helps.',
    expert: 'High-altitude routes with long days and cold nights. For trekkers with several treks behind them.',
};

const steps = [
    { title: 'Find a trek', text: 'Filter by level, duration, season and the city nearest to you.' },
    { title: 'Choose a package', text: 'Trek only, trek with a stay, or all-inclusive with transport from the meet-up point.' },
    { title: 'Go in a group or solo', text: 'Bring your own group, join an open group, or trek solo with a personal guide.' },
    { title: 'Pay once', text: 'Package, transport and guide fee are paid together in one payment.' },
];

export default function Home({ hero, closing, featured, recommended, levels, cities }: HomePageProps) {
    return (
        <PublicLayout closing={closing} search={{ cities }}>
            <Head title="Home" />

            <HomeHero hero={hero} cities={cities} />

            {recommended && recommended.length > 0 && (
                <TrekRow id="recommended" title="Recommended for your level" href={`/treks?level=${recommended[0].level}`} treks={recommended} />
            )}

            {featured.length > 0 && <TrekRow id="featured" title="Featured treks" href="/treks" treks={featured} />}

            <LevelsSection levels={levels} />

            <HowItWorks />
        </PublicLayout>
    );
}

function SectionHeading({ id, title, cta }: { id: string; title: string; cta?: { label: string; href: string } }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 id={id} className="font-display text-3xl leading-tight text-charcoal md:text-4xl">
                {title}
            </h2>
            {cta && (
                <Link
                    href={cta.href}
                    className="inline-flex items-center gap-1.5 rounded-[4px] font-semibold text-forest hover:text-forest-hover hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                    {cta.label}
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}

function levelFacts(level: LevelSummary): string {
    if (level.trek_count === 0 || level.min_days === null || level.max_days === null || level.max_altitude_m === null) {
        return 'No treks listed yet';
    }

    return `${formatDayRange(level.min_days, level.max_days)} · up to ${formatMetres(level.max_altitude_m)}`;
}

function LevelsSection({ levels }: { levels: LevelSummary[] }) {
    return (
        <section aria-labelledby="levels" className="border-y border-stone bg-surface">
            <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 md:py-20">
                <SectionHeading id="levels" title="Treks by level" />
                <p className="mt-3 max-w-2xl text-slate">Every trek has one level. If a trek is above your level, we will tell you before you book.</p>

                <ol className="mt-10 border-t border-stone">
                    {levels.map((level, index) => (
                        <li key={level.value} className="border-b border-stone">
                            <Link
                                href={`/treks?level=${level.value}`}
                                className="group grid gap-2 py-7 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest md:grid-cols-[4rem_14rem_1fr_auto] md:items-baseline md:gap-6"
                            >
                                <span className="font-display text-2xl text-slate" aria-hidden="true">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="font-display text-2xl text-charcoal group-hover:text-forest group-hover:underline group-hover:underline-offset-4 md:text-3xl">
                                    {levelLabels[level.value]}
                                </span>
                                <span className="text-charcoal">
                                    {levelLines[level.value]}
                                    <span className="mt-1 block text-sm text-slate">{levelFacts(level)}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                                    See {levelLabels[level.value].toLowerCase()} treks
                                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section aria-labelledby="how-it-works" className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 md:py-20">
            <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
                <div>
                    <h2 id="how-it-works" className="font-display text-3xl leading-tight text-charcoal md:text-4xl">
                        How it works
                    </h2>
                    <p className="mt-3 text-slate">From choosing a trek to paying, everything happens in one place.</p>
                </div>

                <ol className="border-t border-stone">
                    {steps.map((step, index) => (
                        <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-stone py-6">
                            <span className="font-display text-2xl text-accent-ink">{index + 1}.</span>
                            <div>
                                <h3 className="text-lg font-semibold text-charcoal">{step.title}</h3>
                                <p className="mt-1 text-slate">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
