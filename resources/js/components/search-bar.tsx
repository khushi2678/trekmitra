import SearchSelect from '@/components/search-select';
import { levelLabels } from '@/lib/format';
import { durationOptions, searchQuery, searchStore, useSearch } from '@/lib/search-store';
import type { Level } from '@/types/trek';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { router } from '@inertiajs/react';
import { Fragment, useState, type FormEvent } from 'react';

/*
 * Home search bar in the style of Airbnb's: one rounded bar with three fields
 * (bold label, hint underneath), hairline dividers, and a round search button.
 * While a field is open the bar turns light grey and that field lifts out as a
 * white pill; dividers next to the hovered or open field disappear; the button
 * widens to show "Search". On phones the fields stack in a rounded card.
 * Choices live in the shared search store so the compact header bar matches.
 */

export default function SearchBar({ cities = [] }: { cities?: string[] }) {
    const search = useSearch();
    const [processing, setProcessing] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const active = openIndex !== null;

    function submit(event: FormEvent) {
        event.preventDefault();
        router.get('/treks', searchQuery(search), {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });
    }

    const fields = [
        {
            id: 'search-level',
            label: 'Level',
            placeholder: 'Choose your level',
            anyLabel: 'Any level',
            options: (Object.keys(levelLabels) as Level[]).map((level) => ({ value: level, label: levelLabels[level] })),
            value: search.level,
            onChange: (v: string) => searchStore.set({ level: v }),
        },
        {
            id: 'search-duration',
            label: 'Duration',
            placeholder: 'Add number of days',
            anyLabel: 'Any duration',
            options: durationOptions,
            value: search.duration,
            onChange: (v: string) => searchStore.set({ duration: v }),
        },
        {
            id: 'search-city',
            label: 'Nearest city',
            placeholder: 'Where you start from',
            anyLabel: 'Any city',
            options: cities.map((city) => ({ value: city, label: city })),
            value: search.city,
            onChange: (v: string) => searchStore.set({ city: v }),
        },
    ];

    // A divider sits between field i-1 and field i; hide it when either neighbour is hovered or open.
    const dividerHidden = (i: number) => [i - 1, i].some((n) => n === hoverIndex || n === openIndex);

    return (
        <form
            id="hero-search"
            onSubmit={submit}
            role="search"
            aria-label="Search treks"
            className={`flex w-full max-w-[850px] flex-col gap-1 rounded-[24px] border border-[#E7DFD3] p-2 shadow-[0_3px_12px_rgba(31,41,51,0.08),0_1px_2px_rgba(31,41,51,0.06)] transition-colors duration-200 md:h-[66px] md:flex-row md:items-center md:gap-0 md:rounded-full md:p-0 ${active ? 'md:bg-[#F3ECE1]' : 'bg-page'}`}
        >
            {fields.map((field, i) => (
                <Fragment key={field.id}>
                    {i > 0 && (
                        <span
                            className={`hidden h-8 w-px shrink-0 bg-[#E2D9CB] transition-opacity md:block ${dividerHidden(i) ? 'opacity-0' : 'opacity-100'}`}
                            aria-hidden="true"
                        />
                    )}
                    <div
                        className={`md:flex-1 ${i < 2 ? 'border-b border-stone/70 md:border-0' : ''}`}
                        onPointerEnter={() => setHoverIndex(i)}
                        onPointerLeave={() => setHoverIndex(null)}
                    >
                        <SearchSelect
                            {...field}
                            showChevron={false}
                            onOpenChange={(open) => setOpenIndex(open ? i : null)}
                            className={`w-full rounded-[14px] px-5 py-3 transition-[background-color,box-shadow] duration-200 md:flex md:h-[66px] md:items-center md:rounded-full md:px-8 md:py-0 ${
                                openIndex === i
                                    ? 'bg-surface shadow-[0_6px_20px_-4px_rgba(31,41,51,0.22)]'
                                    : active
                                      ? 'md:hover:bg-[#EAE2D5]'
                                      : 'hover:bg-mint hover:shadow-[inset_0_-2px_0_var(--color-accent)]'
                            }`}
                        />
                    </div>
                </Fragment>
            ))}

            <button
                type="submit"
                disabled={processing}
                aria-label="Search treks"
                className={`mt-1 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-sunrise font-semibold text-forest transition-all duration-300 hover:bg-sunrise-dark hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-70 md:mt-0 md:mr-[9px] md:ml-2 md:h-12 md:rounded-full ${
                    active || processing ? 'px-6 md:px-5' : 'px-6 md:w-12 md:px-0'
                }`}
            >
                {processing ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest/30 border-t-forest" aria-hidden="true" />
                ) : (
                    <MagnifyingGlassIcon className="h-4 w-4 shrink-0 stroke-[3]" aria-hidden="true" />
                )}
                <span className={active || processing ? '' : 'md:sr-only'}>{processing ? 'Searching' : 'Search'}</span>
            </button>
        </form>
    );
}
