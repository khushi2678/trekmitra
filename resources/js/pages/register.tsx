import { ChoiceGroup, GlassButton, GlassError, GlassInput, GlassLabel, GlassPassword } from '@/components/auth/glass-fields';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/*
 * P5. Register (glass design). Fields from the spec: name, email, password,
 * gender, account type (trekker or guide) and, for trekkers, trek level.
 * Coming from "Become a guide" (/register?as=guide) picks "Guide" automatically.
 *
 * Backend note: the starter kit's register action (app/Actions/Fortify/CreateNewUser.php)
 * must validate and save role, gender and trek_level. Until then, Laravel ignores them.
 */

type Props = {
    passwordRules: string;
};

const roles = [
    { value: 'trekker', label: 'Trekker', hint: 'Book and join treks' },
    { value: 'guide', label: 'Guide', hint: 'Lead treks, after approval' },
];

const genders = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' },
];

const linkClass = 'rounded-[4px] font-semibold text-forest underline-offset-4 hover:text-accent-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest';

export default function Register({ passwordRules }: Props) {
    const [role, setRole] = useState('trekker');
    const [gender, setGender] = useState('');
    const [level, setLevel] = useState('');

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('as') === 'guide') setRole('guide');
    }, []);

    return (
        <>
            <Head title="Register" />
            <Form {...store.form()} resetOnSuccess={['password', 'password_confirmation']} disableWhileProcessing className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <ChoiceGroup name="role" legend="I am joining as" options={roles} value={role} onChange={setRole} error={errors.role} />

                        <div>
                            <GlassLabel htmlFor="name">Full name</GlassLabel>
                            <GlassInput id="name" type="text" name="name" required autoFocus autoComplete="name" placeholder="Your full name" error={errors.name} />
                            <GlassError message={errors.name} />
                        </div>

                        <div>
                            <GlassLabel htmlFor="email">Email address</GlassLabel>
                            <GlassInput id="email" type="email" name="email" required autoComplete="email" placeholder="you@example.com" error={errors.email} />
                            <GlassError message={errors.email} />
                        </div>

                        <ChoiceGroup name="gender" legend="Gender" options={genders} value={gender} onChange={setGender} error={errors.gender} />

                        {role === 'trekker' && (
                            <ChoiceGroup name="trek_level" legend="Your trek level" options={levels} value={level} onChange={setLevel} error={errors.trek_level} columns="grid-cols-3" />
                        )}

                        <div>
                            <GlassLabel htmlFor="password">Password</GlassLabel>
                            <GlassPassword id="password" name="password" required autoComplete="new-password" placeholder="Create a password" passwordrules={passwordRules} error={errors.password} />
                            <GlassError message={errors.password} />
                        </div>

                        <div>
                            <GlassLabel htmlFor="password_confirmation">Confirm password</GlassLabel>
                            <GlassPassword
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                placeholder="Type it again"
                                passwordrules={passwordRules}
                                error={errors.password_confirmation}
                            />
                            <GlassError message={errors.password_confirmation} />
                        </div>

                        <GlassButton processing={processing} data-test="register-user-button">
                            {processing ? 'Creating account' : role === 'guide' ? 'Create guide account' : 'Create account'}
                        </GlassButton>

                        <p className="text-center text-sm text-slate">
                            Already have an account?{' '}
                            <Link href={login()} className={linkClass}>
                                Log in
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create your account',
    description: 'Trek with your own group, an open group or a personal guide, all booked in one place.',
};
