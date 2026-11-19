import { GlassButton, GlassError, GlassInput, GlassLabel, GlassPassword } from '@/components/auth/glass-fields';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link } from '@inertiajs/react';

/*
 * P6. Log in (glass design). Form logic is the starter kit's: same fields,
 * same route, same errors and "remember me". Only the look has changed.
 */

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const linkClass = 'rounded-[4px] font-semibold text-forest underline-offset-4 hover:text-accent-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest';

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <p role="status" className="mb-5 rounded-[12px] border border-secondary bg-mint px-4 py-3 text-sm font-medium text-charcoal">
                    {status}
                </p>
            )}

            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div>
                            <GlassLabel htmlFor="email">Email address</GlassLabel>
                            <GlassInput id="email" type="email" name="email" required autoFocus autoComplete="email" placeholder="you@example.com" error={errors.email} />
                            <GlassError message={errors.email} />
                        </div>

                        <div>
                            <GlassLabel
                                htmlFor="password"
                                aside={
                                    canResetPassword ? (
                                        <Link href={request()} className={`text-sm ${linkClass}`}>
                                            Forgot password?
                                        </Link>
                                    ) : undefined
                                }
                            >
                                Password
                            </GlassLabel>
                            <GlassPassword id="password" name="password" required autoComplete="current-password" placeholder="Your password" error={errors.password} />
                            <GlassError message={errors.password} />
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
                            <input type="checkbox" name="remember" className="h-[18px] w-[18px] rounded-[5px] border-white/70 accent-[#0B3D3B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest" />
                            Remember me
                        </label>

                        <GlassButton processing={processing} data-test="login-button">
                            {processing ? 'Logging in' : 'Log in'}
                        </GlassButton>

                        <p className="text-center text-sm text-slate">
                            New to TrekMitra?{' '}
                            <Link href={register()} className={linkClass}>
                                Create an account
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Log in to book treks, see your groups and manage your bookings.',
};
