import { authLink, ChoiceGroup, LightButton, PasswordChecklist, PasswordField, UnderlineField } from '@/components/auth/glass-fields';
import { checkChoice, checkConfirm, checkEmail, checkName, checkNewPassword, passwordRules, type Errors } from '@/lib/auth-validation';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState, type FormEvent } from 'react';

/*
 * P5. Register (TrekMitra light design). Spec fields: name, email, password, gender,
 * account type (trekker or guide) and, for trekkers, trek level.
 * "Become a guide" (/register?as=guide) picks "Guide" automatically.
 * Every field is checked in the browser; the same rules must be enforced on the
 * server in app/Actions/Fortify/CreateNewUser.php (see CreateNewUser.php.snippet).
 */

type Props = {
    passwordRules?: string;
};

const roles = [
    { value: 'trekker', label: 'Trekker', hint: 'Book and join treks' },
    { value: 'guide', label: 'Guide', hint: 'Lead treks, after approval' },
];

const genders = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Rather not say' },
];

const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' },
];

type Field = 'role' | 'name' | 'email' | 'gender' | 'trek_level' | 'password' | 'password_confirmation';
const ORDER: Field[] = ['role', 'name', 'email', 'gender', 'trek_level', 'password', 'password_confirmation'];

export default function Register({ passwordRules: rulesHint }: Props) {
    const form = useForm({
        role: 'trekker',
        name: '',
        email: '',
        gender: '',
        trek_level: '',
        password: '',
        password_confirmation: '',
    });
    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('as') === 'guide') form.setData('role', 'guide');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isTrekker = form.data.role === 'trekker';
    const client: Errors = {
        role: checkChoice(form.data.role, 'trekker or guide'),
        name: checkName(form.data.name),
        email: checkEmail(form.data.email),
        gender: checkChoice(form.data.gender, 'a gender option'),
        trek_level: isTrekker ? checkChoice(form.data.trek_level, 'your trek level') : undefined,
        password: checkNewPassword(form.data.password),
        password_confirmation: checkConfirm(form.data.password, form.data.password_confirmation),
    };
    const errors = form.errors as Partial<Record<Field, string>>;
    const show = (f: Field) => errors[f] ?? ((touched[f] || submitted) ? client[f] : undefined);
    const touch = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

    function submit(e: FormEvent) {
        e.preventDefault();
        setSubmitted(true);
        const first = ORDER.find((f) => client[f]);
        if (first) {
            const el = document.getElementById(first) ?? document.querySelector<HTMLInputElement>(`input[name="${first}"]`);
            el?.focus();
            return;
        }
        form.transform((data) => ({ ...data, name: data.name.trim(), email: data.email.trim(), trek_level: data.role === 'trekker' ? data.trek_level : '' }));
        form.post(store.url(), { onFinish: () => form.reset('password', 'password_confirmation') });
    }

    return (
        <>
            <Head title="Register" />
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                <ChoiceGroup name="role" legend="I am joining as" options={roles} value={form.data.role} onChange={(v) => form.setData('role', v)} error={show('role')} />

                <UnderlineField
                    id="name"
                    label="Enter your full name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    required
                    maxLength={80}
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    onBlur={touch('name')}
                    error={show('name')}
                />

                <UnderlineField
                    id="email"
                    label="Enter your email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    onBlur={touch('email')}
                    error={show('email')}
                />

                <ChoiceGroup
                    name="gender"
                    legend="Gender"
                    options={genders}
                    value={form.data.gender}
                    onChange={(v) => {
                        form.setData('gender', v);
                        setTouched((t) => ({ ...t, gender: true }));
                    }}
                    error={show('gender')}
                    columns="grid-cols-2 sm:grid-cols-4"
                />

                {isTrekker && (
                    <ChoiceGroup
                        name="trek_level"
                        legend="Your trek level"
                        options={levels}
                        value={form.data.trek_level}
                        onChange={(v) => {
                            form.setData('trek_level', v);
                            setTouched((t) => ({ ...t, trek_level: true }));
                        }}
                        error={show('trek_level')}
                        columns="grid-cols-3"
                    />
                )}

                <div>
                    <PasswordField
                        id="password"
                        label="Create a password"
                        name="password"
                        autoComplete="new-password"
                        required
                        passwordrules={rulesHint}
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        onBlur={touch('password')}
                        error={show('password')}
                    />
                    <PasswordChecklist rules={passwordRules} value={form.data.password} />
                </div>

                <PasswordField
                    id="password_confirmation"
                    label="Confirm your password"
                    name="password_confirmation"
                    autoComplete="new-password"
                    required
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                    onBlur={touch('password_confirmation')}
                    error={show('password_confirmation')}
                />

                <LightButton processing={form.processing} data-test="register-user-button">
                    {form.processing ? 'Creating account' : isTrekker ? 'Register' : 'Register as a guide'}
                </LightButton>

                <p className="text-center text-sm text-[#65736B]">
                    Already have an account?{' '}
                    <Link href={login()} className={authLink}>
                        Log in
                    </Link>
                </p>
            </form>
        </>
    );
}

Register.layout = {
    title: 'Register',
    description: 'Trek with your own group, an open group or a personal guide.',
};
