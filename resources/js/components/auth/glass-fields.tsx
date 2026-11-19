
import {
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

import {
    useState,
    type InputHTMLAttributes,
    type ReactNode,
} from 'react';

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
    id: string;
    label: string;
    error?: string;
    trailing?: ReactNode;
};

/* Underline authentication field */

export function UnderlineField({
    id,
    label,
    error,
    trailing,
    className = '',
    ...props
}: FieldProps) {
    const errorId = `${id}-error`;

    return (
        <div className={className}>
            <div className="relative">

                <input
                    id={id}
                    placeholder=" "
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    {...props}
                    className={`peer block h-14 w-full border-0 border-b bg-transparent px-0 pt-5 pb-1.5 text-[15px] text-[#174C3C] caret-[#B58B55] outline-none transition-colors placeholder:text-transparent focus:border-[#B58B55] ${
                        error
                            ? 'border-red-400'
                            : 'border-[#174C3C]/25'
                    } ${trailing ? 'pr-10' : ''}`}
                />

                <label
                    htmlFor={id}
                    className="pointer-events-none absolute top-[22px] left-0 origin-left text-[15px] text-[#849087] transition-all duration-200 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#A17A48] peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs motion-reduce:transition-none"
                >
                    {label}
                </label>

                {trailing && (
                    <div className="absolute right-0 bottom-1.5">
                        {trailing}
                    </div>
                )}
            </div>

            {error && (
                <p
                    id={errorId}
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-red-600"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

/* Password field */

export function PasswordField(
    props: Omit<FieldProps, 'type' | 'trailing'> & {
        passwordrules?: string;
    }
) {
    const [show, setShow] = useState(false);

    const { passwordrules, ...rest } = props;

    const extra = passwordrules
        ? ({ passwordrules } as Record<string, string>)
        : {};

    return (
        <UnderlineField
            {...rest}
            {...extra}
            type={show ? 'text' : 'password'}
            trailing={
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    aria-pressed={show}
                    className="grid h-8 w-8 place-items-center rounded-full text-[#849087] transition-colors hover:bg-[#DCE8DE] hover:text-[#174C3C] focus-visible:outline-2 focus-visible:outline-[#B58B55]"
                >
                    {show ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                </button>
            }
        />
    );
}

/* Choice group */

export function ChoiceGroup({
    name,
    legend,
    options,
    value,
    onChange,
    error,
    columns = 'grid-cols-2',
}: {
    name: string;
    legend: string;
    options: { value: string; label: string; hint?: string }[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    columns?: string;
}) {
    return (
        <fieldset aria-invalid={error ? true : undefined}>

            <legend className="mb-2 text-[13px] font-semibold tracking-wide text-[#174C3C]">
                {legend}
            </legend>

            <div className={`grid gap-2 ${columns}`}>
                {options.map((o) => (
                    <label
                        key={o.value}
                        className={`flex cursor-pointer flex-col justify-center rounded-xl border px-3 py-3 text-sm transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#B58B55] ${
                            value === o.value
                                ? 'border-[#174C3C] bg-[#DCE8DE] font-semibold text-[#174C3C]'
                                : `${
                                    error
                                        ? 'border-red-300'
                                        : 'border-[#174C3C]/15'
                                } bg-white/70 text-[#174C3C] hover:border-[#174C3C]/40 hover:bg-[#DCE8DE]/50`
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={o.value}
                            checked={value === o.value}
                            onChange={() => onChange(o.value)}
                            className="sr-only"
                        />

                        <span>{o.label}</span>

                        {o.hint && (
                            <span
                                className={`mt-0.5 text-xs font-normal ${
                                    value === o.value
                                        ? 'text-[#426456]'
                                        : 'text-[#849087]'
                                }`}
                            >
                                {o.hint}
                            </span>
                        )}
                    </label>
                ))}
            </div>

            {error && (
                <p role="alert" className="mt-1.5 text-[13px] font-medium text-red-600">
                    {error}
                </p>
            )}
        </fieldset>
    );
}

/* Password requirements */

export function PasswordChecklist({
    rules,
    value,
}: {
    rules: {
        id: string;
        label: string;
        test: (v: string) => boolean;
    }[];
    value: string;
}) {
    return (
        <ul className="mt-3 grid gap-2" aria-label="Password requirements">
            {rules.map((r) => {
                const ok = r.test(value);

                return (
                    <li
                        key={r.id}
                        className={`flex items-center gap-2 text-[13px] ${
                            ok ? 'text-[#426456]' : 'text-[#849087]'
                        }`}
                    >
                        <CheckCircleIcon
                            className={`h-4 w-4 ${
                                ok ? 'opacity-100' : 'opacity-40'
                            }`}
                            aria-hidden="true"
                        />

                        {r.label}

                        <span className="sr-only">
                            {ok ? '(done)' : '(not yet)'}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}

/* Submit button */

export function LightButton({
    processing,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    processing?: boolean;
}) {
    return (
        <button
            type="submit"
            disabled={processing}
            {...props}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#174C3C] text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-[#103D30] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B58B55] disabled:cursor-not-allowed disabled:opacity-70"
        >
            {processing && (
                <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                />
            )}

            {children}
        </button>
    );
}

/* Authentication links */

export const authLink =
    'rounded-[4px] font-semibold text-[#174C3C] underline-offset-4 hover:text-[#A17A48] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174C3C]';
