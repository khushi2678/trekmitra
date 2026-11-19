import { Bars3Icon, UserIcon } from '@heroicons/react/24/outline';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { Link } from '@inertiajs/react';

/*
 * Right side of the header, like Airbnb's: "Become a guide", a round profile
 * button and a round menu button. The menu lists log in / sign up for visitors,
 * and account pages for logged-in users depending on their role (Section 4).
 * Built on Radix Dropdown Menu (in the starter kit): keyboard and screen readers work.
 */

export interface MenuUser {
    name: string;
    role?: 'trekker' | 'guide' | 'admin' | string;
}

type Item = { label: string; href: string; strong?: boolean } | 'divider';

function itemsFor(user: MenuUser | null): Item[] {
    if (!user) {
        return [
            { label: 'Log in', href: '/login', strong: true },
            { label: 'Sign up', href: '/register' },
            'divider',
            { label: 'Become a guide', href: '/register?as=guide' },
            { label: 'Altitude sickness guide', href: '/safety/altitude-sickness' },
        ];
    }
    if (user.role === 'guide') {
        return [
            { label: 'Guide dashboard', href: '/guide/dashboard', strong: true },
            { label: 'Guide profile', href: '/guide/profile' },
        ];
    }
    if (user.role === 'admin') {
        return [{ label: 'Admin panel', href: '/admin', strong: true }];
    }
    return [
        { label: 'My bookings', href: '/account/bookings', strong: true },
        { label: 'My groups', href: '/account/groups' },
        { label: 'Profile', href: '/account/profile' },
        'divider',
        { label: 'Altitude sickness guide', href: '/safety/altitude-sickness' },
    ];
}

function profileHref(user: MenuUser | null) {
    if (!user) return '/login';
    if (user.role === 'guide') return '/guide/dashboard';
    if (user.role === 'admin') return '/admin';
    return '/account/profile';
}

const circle =
    'grid h-11 w-11 place-items-center rounded-full bg-page text-charcoal transition-colors hover:bg-[#F3ECE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest';

const itemClass =
    'block w-full cursor-pointer px-5 py-3 text-left text-[15px] text-charcoal outline-none data-[highlighted]:bg-mint';

export default function AccountMenu({ user }: { user: MenuUser | null }) {
    const items = itemsFor(user);
    const isA = (role: string) => user?.role === role;

    return (
        <div className="flex items-center gap-2">
            {!isA('guide') && !isA('admin') && (
                <Link
                    href="/register?as=guide"
                    className="rounded-full px-4 py-3 text-[15px] font-semibold text-charcoal transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                    Become a guide
                </Link>
            )}

            <Link href={profileHref(user)} aria-label={user ? `Your account, ${user.name}` : 'Log in'} className={circle}>
                {user ? (
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-charcoal text-sm font-semibold text-white" aria-hidden="true">
                        {user.name.trim().charAt(0).toUpperCase()}
                    </span>
                ) : (
                    <UserIcon className="h-5 w-5 stroke-2" aria-hidden="true" />
                )}
            </Link>

            <Menu.Root modal={false}>
                <Menu.Trigger aria-label="Open menu" className={`${circle} data-[state=open]:bg-[#F3ECE1]`}>
                    <Bars3Icon className="h-5 w-5 stroke-2" aria-hidden="true" />
                </Menu.Trigger>
                <Menu.Portal>
                    <Menu.Content
                        align="end"
                        sideOffset={10}
                        className="tm-select-content z-50 w-64 overflow-hidden rounded-[14px] border border-[#E7DFD3] bg-surface py-2 font-sans shadow-[0_8px_28px_rgba(31,41,51,0.16)]"
                    >
                        {user && (
                            <>
                                <div className="px-5 pt-2 pb-3">
                                    <p className="truncate text-[15px] font-semibold text-charcoal">{user.name}</p>
                                </div>
                                <Menu.Separator className="my-1 h-px bg-stone/70" />
                            </>
                        )}
                        {items.map((item, i) =>
                            item === 'divider' ? (
                                <Menu.Separator key={`d${i}`} className="my-1 h-px bg-stone/70" />
                            ) : (
                                <Menu.Item key={item.href + item.label} asChild>
                                    <Link href={item.href} className={`${itemClass} ${item.strong ? 'font-semibold' : ''}`}>
                                        {item.label}
                                    </Link>
                                </Menu.Item>
                            ),
                        )}
                        {user && (
                            <>
                                <Menu.Separator className="my-1 h-px bg-stone/70" />
                                <Menu.Item asChild>
                                    <Link href="/logout" method="post" as="button" className={itemClass}>
                                        Log out
                                    </Link>
                                </Menu.Item>
                            </>
                        )}
                    </Menu.Content>
                </Menu.Portal>
            </Menu.Root>
        </div>
    );
}
