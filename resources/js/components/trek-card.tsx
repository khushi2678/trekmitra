import { formatDays, formatMetres, formatRupees, levelLabels } from '@/lib/format';
import type { Level, TrekCard as TrekCardData } from '@/types/trek';
import { HeartIcon } from '@heroicons/react/24/solid';
import { Link } from '@inertiajs/react';
import { useEffect, useId, useState } from 'react';

/*
 * Trek card sized like Airbnb's listing cards: a near-square photo with rounded
 * corners, a level pill (white with a coloured dot) top-left, a save heart
 * top-right (pink-to-red gradient when saved), then three short lines of text underneath.
 *
 * The heart is remembered in this browser only (localStorage) until saved treks
 * are added to accounts. The heart is a separate button, not inside the link, so
 * tapping it never opens the trek.
 */

const dot: Record<Level, string> = {
    beginner: 'bg-[#2E7D32]',
    intermediate: 'bg-[#8F5500]',
    expert: 'bg-[#B91C1C]',
};

const STORAGE_KEY = 'tm-saved-treks';

function readSaved(): string[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

function writeSaved(slugs: string[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
        // Storage can be unavailable (private mode); the heart still works for this visit.
    }
}

function SaveButton({ slug, name }: { slug: string; name: string }) {
    const [saved, setSaved] = useState(false);
    // Unique id for this heart's gradient (useId gives ":r1:", which is not valid in url()).
    const gradientId = `tm-heart-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
    const [pop, setPop] = useState(false);

    useEffect(() => {
        setSaved(readSaved().includes(slug));
    }, [slug]);

    function toggle() {
        const list = readSaved();
        const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
        writeSaved(next);
        setSaved(next.includes(slug));
        setPop(true);
        window.setTimeout(() => setPop(false), 300);
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${name} from saved treks` : `Save ${name}`}
            className="absolute top-2 right-2 z-10 grid h-10 w-10 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
            {/* Pink-to-red gradient for a saved heart */}
            <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#BD1E59" />
                        <stop offset="50%" stopColor="#D70466" />
                        <stop offset="100%" stopColor="#F0284E" />
                    </linearGradient>
                </defs>
            </svg>
            <HeartIcon
                style={saved ? { fill: `url(#${gradientId})` } : undefined}
                className={`h-6 w-6 transition-transform duration-200 motion-reduce:transition-none [&_path]:stroke-white [&_path]:stroke-[1.5] ${saved ? '' : 'text-black/50'} ${pop ? 'scale-125' : 'scale-100'}`}
                aria-hidden="true"
            />
        </button>
    );
}

export default function TrekCard({ trek }: { trek: TrekCardData }) {
    return (
        <div className="group relative">
            <Link
                href={`/treks/${trek.slug}`}
                className="block rounded-[16px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
            >
                <div className="relative aspect-[20/19] overflow-hidden rounded-[16px] bg-stone/40">
                    {trek.cover_url && <img src={trek.cover_url} alt={`${trek.name}, ${trek.state}`} loading="lazy" className="h-full w-full object-cover" />}
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-charcoal shadow-[0_1px_4px_rgba(31,41,51,0.18)]">
                        <span className={`h-2 w-2 rounded-full ${dot[trek.level]}`} aria-hidden="true" />
                        {levelLabels[trek.level]}
                    </span>
                </div>

                <div className="mt-2.5 px-0.5">
                    <h3 className="truncate text-[15px] leading-5 font-semibold text-charcoal group-hover:underline group-hover:underline-offset-2">
                        {trek.name}
                    </h3>
                    <p className="mt-0.5 truncate text-sm leading-5 text-slate">
                        {trek.nearest_city}, {trek.state}
                    </p>
                    <p className="truncate text-sm leading-5 text-slate">
                        {formatDays(trek.duration_days)}, up to {formatMetres(trek.max_altitude_m)}
                    </p>
                    {trek.from_price !== null && (
                        <p className="mt-1 text-sm leading-5 text-charcoal">
                            <span className="font-semibold">{formatRupees(trek.from_price)}</span> per person
                        </p>
                    )}
                </div>
            </Link>

            <SaveButton slug={trek.slug} name={trek.name} />
        </div>
    );
}
