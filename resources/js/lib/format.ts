const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat('en-IN');

/** Paise to "₹4,500" (no decimals when the amount is whole). */
export function formatRupees(paise: number): string {
    return `₹${inr.format(paise / 100)}`;
}

export function formatDays(days: number): string {
    return days === 1 ? '1 day' : `${days} days`;
}

export function formatDayRange(min: number, max: number): string {
    return min === max ? formatDays(min) : `${min} to ${max} days`;
}

export function formatMetres(metres: number): string {
    return `${plain.format(metres)} m`;
}

export const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    expert: 'Expert',
} as const;
