/*
 * Client-side checks for the login and register forms. They give quick feedback;
 * the same rules are enforced on the server (see CreateNewUser.php.snippet),
 * and server errors always take priority.
 */

export type Errors = Partial<Record<string, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME = /^[\p{L}][\p{L} .'-]*$/u;

export function checkEmail(v: string): string | undefined {
    const t = v.trim();
    if (!t) return 'Enter your email address.';
    if (t.length > 255) return 'Email must be 255 characters or fewer.';
    if (!EMAIL.test(t)) return 'Enter a valid email address, like name@example.com.';
}

export function checkLoginPassword(v: string): string | undefined {
    if (!v) return 'Enter your password.';
}

export function checkName(v: string): string | undefined {
    const t = v.trim();
    if (!t) return 'Enter your full name.';
    if (t.length < 2) return 'Name must be at least 2 characters.';
    if (t.length > 80) return 'Name must be 80 characters or fewer.';
    if (!NAME.test(t)) return 'Use letters, spaces, dots, apostrophes or hyphens only.';
}

/** Password rules shown as a live checklist on the register page. */
export const passwordRules = [
    { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
    { id: 'case', label: 'Upper and lower case letters', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
    { id: 'number', label: 'At least one number', test: (v: string) => /\d/.test(v) },
];

export function checkNewPassword(v: string): string | undefined {
    if (!v) return 'Create a password.';
    const failed = passwordRules.find((r) => !r.test(v));
    if (failed) return `Password needs: ${failed.label.toLowerCase()}.`;
}

export function checkConfirm(password: string, confirm: string): string | undefined {
    if (!confirm) return 'Type your password again.';
    if (confirm !== password) return 'Passwords do not match.';
}

export function checkChoice(v: string, what: string): string | undefined {
    if (!v) return `Choose ${what}.`;
}
