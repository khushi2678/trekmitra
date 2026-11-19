import TrekCard from '@/components/trek-card';
import type { TrekCard as TrekCardData } from '@/types/trek';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * A row of trek cards like Airbnb's: title with a small arrow link, previous and
 * next buttons on the right, and cards that scroll sideways (6 visible on wide
 * screens, fewer on smaller ones, swipeable on phones).
 */

export default function TrekRow({ id, title, href, treks }: { id: string; title: string; href: string; treks: TrekCardData[] }) {
    const rowRef = useRef<HTMLUListElement>(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const update = useCallback(() => {
        const row = rowRef.current;
        if (!row) return;
        setCanPrev(row.scrollLeft > 4);
        setCanNext(row.scrollLeft + row.clientWidth < row.scrollWidth - 4);
    }, []);

    useEffect(() => {
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [update]);

    function scroll(dir: 1 | -1) {
        const row = rowRef.current;
        if (!row) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        row.scrollBy({ left: dir * row.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    }

    const arrow =
        'grid h-8 w-8 place-items-center rounded-full border border-[#E7DFD3] bg-surface text-charcoal transition-[background-color,box-shadow] hover:shadow-[0_2px_8px_rgba(31,41,51,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-default disabled:opacity-40 disabled:hover:shadow-none';

    return (
        <section aria-labelledby={id} className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 md:py-12">
            <div className="flex items-center justify-between gap-4">
                <Link href={href} className="group inline-flex items-center gap-2 rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
                    <h2 id={id} className="font-display text-2xl leading-tight font-semibold text-charcoal md:text-[28px]">
                        {title}
                    </h2>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-page transition-colors group-hover:bg-[#F3ECE1]" aria-hidden="true">
                        <ArrowRightIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                </Link>

                {(canPrev || canNext) && (
                    <div className="hidden items-center gap-2 sm:flex">
                        <button type="button" className={arrow} onClick={() => scroll(-1)} disabled={!canPrev} aria-label="Previous treks" aria-controls={`${id}-list`}>
                            <ChevronLeftIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                        </button>
                        <button type="button" className={arrow} onClick={() => scroll(1)} disabled={!canNext} aria-label="More treks" aria-controls={`${id}-list`}>
                            <ChevronRightIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            <ul
                id={`${id}-list`}
                ref={rowRef}
                onScroll={update}
                className="tm-row -mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
            >
                {treks.map((trek) => (
                    <li
                        key={trek.id}
                        className="w-[68%] shrink-0 snap-start sm:w-[calc((100%-2*16px)/3)] md:w-[calc((100%-3*16px)/4)] lg:w-[calc((100%-4*16px)/5)] xl:w-[calc((100%-5*16px)/6)]"
                    >
                        <TrekCard trek={trek} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
