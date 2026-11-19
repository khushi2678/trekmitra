import { useSyncExternalStore } from 'react';

/*
 * Shared state for the home search, so the big search bar in the hero and the
 * compact one in the sticky header always show the same choices.
 */

export interface SearchState {
    level: string;
    duration: string;
    city: string;
}

let state: SearchState = { level: '', duration: '', city: '' };
const listeners = new Set<() => void>();

export const searchStore = {
    get: () => state,
    set(patch: Partial<SearchState>) {
        state = { ...state, ...patch };
        listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};

export function useSearch(): SearchState {
    return useSyncExternalStore(searchStore.subscribe, searchStore.get, searchStore.get);
}

/** Query string for /treks, without empty filters. */
export function searchQuery(s: SearchState): Record<string, string> {
    return Object.fromEntries(Object.entries(s).filter(([, value]) => value !== ''));
}

export const durationOptions = [
    { value: '1', label: '1 day' },
    { value: '2-3', label: '2 to 3 days' },
    { value: '4-plus', label: '4 days or more' },
];
