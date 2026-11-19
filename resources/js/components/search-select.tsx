import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import * as Select from '@radix-ui/react-select';

/*
 * One fill-in-the-blank word in the home search sentence, e.g. "any level".
 * The word is the trigger; its menu is styled to match TrekMitra.
 * Built on Radix Select (already in the starter kit): keyboard, type-ahead
 * and screen readers work out of the box. `label` is the accessible name.
 */

const ANY = '__any';

export interface SearchOption {
    value: string;
    /** How the option reads inside the sentence, e.g. "beginners". */
    label: string;
}

export default function SearchSelect({
    id,
    label,
    anyLabel,
    options,
    value,
    onChange,
    variant = 'field',
    className = '',
    showChevron = true,
    onOpenChange,
    placeholder,
}: {
    id: string;
    label: string;
    anyLabel: string;
    options: SearchOption[];
    value: string;
    onChange: (value: string) => void;
    variant?: 'field' | 'inline';
    className?: string;
    showChevron?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Shown when nothing is chosen (field variant), e.g. "Choose your level". */
    placeholder?: string;
}) {
    const usePlaceholder = variant === 'field' && placeholder !== undefined;
    return (
        <Select.Root value={value === '' ? (usePlaceholder ? '' : ANY) : value} onValueChange={(v) => onChange(v === ANY ? '' : v)} onOpenChange={onOpenChange}>
            {variant === 'field' ? (
                <Select.Trigger
                    id={id}
                    aria-label={label}
                    className={`group flex min-w-0 cursor-pointer items-center gap-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset ${className}`}
                >
                    <span className="min-w-0 flex-1">
                        <span className="block text-xs leading-4 font-semibold text-charcoal">{label}</span>
                        <span className={`mt-0.5 block truncate text-sm leading-[18px] ${value === '' ? 'text-slate' : 'text-charcoal'}`}>
                            <Select.Value placeholder={placeholder} />
                        </span>
                    </span>
                    {showChevron && (
                        <Select.Icon asChild>
                            <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
                        </Select.Icon>
                    )}
                </Select.Trigger>
            ) : (
            <Select.Trigger
                id={id}
                aria-label={label}
                className="group inline-flex cursor-pointer items-baseline gap-1.5 rounded-[3px] border-b-2 border-forest/35 pb-0.5 text-forest transition-colors outline-none hover:border-forest focus-visible:border-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest data-[state=open]:border-forest"
            >
                <Select.Value />
                <Select.Icon asChild>
                    <ChevronDownIcon
                        className="relative top-[0.08em] h-[0.55em] w-[0.55em] shrink-0 stroke-[2.5] transition-transform duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                    />
                </Select.Icon>
            </Select.Trigger>
            )}

            <Select.Portal>
                <Select.Content
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={variant === 'field' ? 14 : 10}
                    className="tm-select-content z-50 max-h-[min(340px,var(--radix-select-content-available-height))] min-w-[240px] overflow-hidden rounded-[10px] border border-stone bg-surface p-1.5 font-sans shadow-[0_18px_44px_-18px_rgba(31,41,51,0.35)]"
                >
                    <Select.Viewport>
                        {[{ value: ANY, label: anyLabel }, ...options].map((option) => (
                            <Select.Item
                                key={option.value}
                                value={option.value}
                                className="relative flex min-h-11 cursor-pointer items-center rounded-[6px] py-2 pr-10 pl-3 text-base text-charcoal outline-none select-none data-[highlighted]:bg-mint data-[state=checked]:font-semibold data-[state=checked]:text-forest"
                            >
                                <Select.ItemText>{option.label}</Select.ItemText>
                                <Select.ItemIndicator className="absolute right-3 inline-flex items-center">
                                    <CheckIcon className="h-4 w-4 text-forest" aria-hidden="true" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
