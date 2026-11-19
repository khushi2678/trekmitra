import { authLink, LightButton, PasswordField, UnderlineField } from '@/components/auth/glass-fields';
import { checkEmail, checkLoginPassword, type Errors } from '@/lib/auth-validation';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

/*
 * P6. Log in (TrekMitra light design). Posts to the starter kit's login route with the
 * same fields (email, password, remember). Fields are checked in the browser
 * when you leave them and when you submit; server errors still show and win.
 */

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const form = useForm({ email: '', password: '', remember: false });
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);

    const client: Errors = {
        email: checkEmail(form.data.email),
        password: checkLoginPassword(form.data.password),
    };
    const show = (field: 'email' | 'password') => form.errors[field] ?? ((touched[field] || submitted) ? client[field] : undefined);

    function submit(e: FormEvent) {
        e.preventDefault();
        setSubmitted(true);
        const first = (['email', 'password'] as const).find((f) => client[f]);
        if (first) {
            document.getElementById(first)?.focus();
            return;
        }
        form.post(store.url(), { onFinish: () => form.reset('password') });
    }

    return (
        <>
            <Head title="Log in" />

            {status && (
                <p role="status" className="mb-5 rounded-[10px] border border-[#174C3C]/15 bg-[#DCE8DE] px-4 py-3 text-center text-sm font-medium text-[#174C3C]">
                    {status}
                </p>
            )}

            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
                <UnderlineField
                    id="email"
                    label="Enter your email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    required
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    error={show('email')}
                />

                <PasswordField
                    id="password"
                    label="Enter your password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    error={show('password')}
                />

                <div className="flex items-center justify-between gap-3 text-[13px]">
                    <label className="flex cursor-pointer items-center gap-2 text-[#426456] select-none">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                            className="h-4 w-4 cursor-pointer rounded-[4px] accent-[#174C3C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B58B55]"
                        />
                        Remember me
                    </label>
                    {canResetPassword && (
                        <Link href={request()} className={authLink}>
                            Forgot password?
                        </Link>
                    )}
                </div>

                <LightButton processing={form.processing} data-test="login-button">
                    {form.processing ? 'Logging in' : 'Log in'}
                </LightButton>

                <p className="text-center text-sm text-[#65736B]">
                    Don&apos;t have an account?{' '}
                    <Link href={register()} className={authLink}>
                        Register
                    </Link>
                </p>
            </form>
        </>
    );
}

Login.layout = {
    title: 'Log in',
    description: '',
};
