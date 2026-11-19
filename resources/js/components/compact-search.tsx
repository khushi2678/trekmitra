import { levelLabels } from '@/lib/format';
import { durationOptions, useSearch } from '@/lib/search-store';
import type { Level } from '@/types/trek';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/*
 * Small search pill shown in the sticky header once the big hero search has
 * scrolled away (like Airbnb's "Anywhere | Anytime | Add guests").
 * Clicking it unfolds the header again, with the big search, where you are.
 */

export default function CompactSearch({ visible, onExpand }: { visible: boolean; onExpand: () => void }) {
    const search = useSearch();
    const level = search.level ? levelLabels[search.level as Level] : 'Any level';
    const duration = durationOptions.find((d) => d.value === search.duration)?.label ?? 'Any duration';
    const city = search.city || 'Any city';

    return (
        <button
            type="button"
            onClick={onExpand}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            aria-label={`Search treks: ${level}, ${duration}, ${city}`}
            className={`tm-compact absolute top-1/2 left-1/2 flex h-12 items-center rounded-full border border-[#E7DFD3] bg-page pr-2 pl-5 text-[15px] font-semibold whitespace-nowrap text-charcoal shadow-[0_3px_12px_rgba(31,41,51,0.08),0_1px_2px_rgba(31,41,51,0.06)] transition-shadow hover:shadow-[0_6px_18px_rgba(31,41,51,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${visible ? 'is-visible' : ''}`}
        >
            <span className="pr-4">{level}</span>
            <span className="h-6 w-px bg-[#E2D9CB]" aria-hidden="true" />
            <span className="px-4">{duration}</span>
            <span className="h-6 w-px bg-[#E2D9CB]" aria-hidden="true" />
            <span className={`px-4 ${search.city ? '' : 'font-normal text-slate'}`}>{city}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sunrise text-forest" aria-hidden="true">
                <MagnifyingGlassIcon className="h-3.5 w-3.5 stroke-[3]" />
            </span>
        </button>
    );
}
