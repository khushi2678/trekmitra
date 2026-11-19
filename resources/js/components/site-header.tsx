import AccountMenu, { type MenuUser } from '@/components/account-menu';
import AppLogoIcon from '@/components/app-logo-icon';
import CompactSearch from '@/components/compact-search';
import { levelLabels } from '@/lib/format';
import type { SharedData } from '@/types';
import type { Level, NavMenuData } from '@/types/trek';
import { Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * Header with a morphing dropdown, adapted from the MotionSites "Atlas Nav" design.
 * One shared panel container slides, resizes and crossfades between menus instead
 * of closing and reopening. Styles live in app.css under "Header menu".
 */

type MenuId = 'treks' | 'ways' | 'regions';
const ORDER: MenuId[] = ['treks', 'ways', 'regions'];
const PAD = 20; // panel padding (8) + row padding (12): lines panel text up with its trigger text

const levelLines: Record<Level, string> = {
    beginner: 'Short treks on clear trails, good for your first few.',
    intermediate: 'Longer days, steeper climbs, some overnight routes.',
    expert: 'High-altitude routes with long days and cold nights.',
};

const ways = [
    { title: 'Bring your own group', text: 'Book seats for your friends or family. Only your people, one guide.' },
    { title: 'Join an open group', text: 'Take a seat in a group that is already forming. Women-only groups too.' },
    { title: 'Trek solo with a guide', text: 'Just you and a personal guide, at your own pace.' },
];


function Chevron() {
    return (
        <svg className="tm-chev" width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
            <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// `search` is accepted for compatibility; the big search bar lives in the home hero.
export default function SiteHeader(_props: { search?: { cities: string[] } }) {
    const { auth, nav } = usePage<SharedData & { nav: NavMenuData }>().props;
    const levels = nav?.levels ?? [];
    const states = nav?.states ?? [];

    const barRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const ddRef = useRef<HTMLDivElement>(null);
    const triggerRefs = useRef<Record<MenuId, HTMLButtonElement | null>>({ treks: null, ways: null, regions: null });
    const panelRefs = useRef<Record<MenuId, HTMLDivElement | null>>({ treks: null, ways: null, regions: null });
    const currentRef = useRef<MenuId | null>(null);
    const closeTimer = useRef<number | undefined>(undefined);

    const [current, setCurrent] = useState<MenuId | null>(null);
    const [activeLevel, setActiveLevel] = useState(0);
    const [sheetOpen, setSheetOpen] = useState(false);

    const place = useCallback((id: MenuId) => {
        const dd = ddRef.current;
        const panel = panelRefs.current[id];
        const trigger = triggerRefs.current[id];
        const bar = barRef.current;
        if (!dd || !panel || !trigger || !bar) return;

        const w = panel.offsetWidth;
        const h = panel.offsetHeight;
        const barRect = bar.getBoundingClientRect();
        const parentLeft = (dd.offsetParent as HTMLElement | null)?.getBoundingClientRect().left ?? barRect.left;
        let x = trigger.getBoundingClientRect().left - PAD;
        x = Math.max(barRect.left + 12, Math.min(x, barRect.right - w - 12));

        dd.style.setProperty('--x', `${x - parentLeft}px`);
        dd.style.setProperty('--w', `${w}px`);
        dd.style.setProperty('--h', `${h}px`);
    }, []);

    const close = useCallback(() => {
        window.clearTimeout(closeTimer.current);
        const dd = ddRef.current;
        const id = currentRef.current;
        if (!dd || !id) return;
        dd.classList.remove('open');
        panelRefs.current[id]?.removeAttribute('data-state');
        currentRef.current = null;
        setCurrent(null);
    }, []);

    const scheduleClose = useCallback(
        (ms = 140) => {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = window.setTimeout(close, ms);
        },
        [close],
    );

    const open = useCallback(
        (id: MenuId) => {
            window.clearTimeout(closeTimer.current);
            const dd = ddRef.current;
            const panel = panelRefs.current[id];
            if (!dd || !panel || currentRef.current === id) return;
            const prev = currentRef.current;

            if (!prev) {
                // First open: appear in place, no position/size animation.
                dd.classList.add('instant', 'snap');
                ORDER.forEach((m) => {
                    const p = panelRefs.current[m];
                    if (p) {
                        p.classList.add('snap');
                        p.removeAttribute('data-state');
                    }
                });
                place(id);
                void dd.offsetWidth;
                dd.classList.remove('snap');
                ORDER.forEach((m) => panelRefs.current[m]?.classList.remove('snap'));
                dd.classList.add('open');
                requestAnimationFrame(() => dd.classList.remove('instant'));
            } else {
                // Switch: slide in the direction of travel while the container morphs.
                const dir = ORDER.indexOf(id) > ORDER.indexOf(prev) ? 1 : -1;
                panelRefs.current[prev]?.setAttribute('data-state', dir > 0 ? 'exit-left' : 'exit-right');
                panel.classList.add('snap');
                panel.setAttribute('data-state', dir > 0 ? 'exit-right' : 'exit-left');
                void panel.offsetWidth;
                panel.classList.remove('snap');
                place(id);
            }

            panel.setAttribute('data-state', 'active');
            currentRef.current = id;
            setCurrent(id);
        },
        [place],
    );

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            const id = currentRef.current;
            if (id) {
                close();
                triggerRefs.current[id]?.focus();
            }
            setSheetOpen(false);
        }
        function onPointerDown(e: PointerEvent) {
            if (currentRef.current && navRef.current && !navRef.current.contains(e.target as Node)) close();
        }
        function onResize() {
            if (currentRef.current) place(currentRef.current);
        }
        document.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('resize', onResize);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('resize', onResize);
            window.clearTimeout(closeTimer.current);
        };
    }, [close, place]);

    /*
     * Show the compact search in the header once the hero search has scrolled under it (home page).
     * The hero search is looked up fresh on every check, so this keeps working after hot reloads
     * and page visits that redraw it. A small gap stops it flickering right at the edge.
     */
    const [compact, setCompact] = useState(false);
    useEffect(() => {
        const HEADER = 77;
        let frame = 0;
        const check = () => {
            frame = 0;
            const target = document.getElementById('hero-search');
            if (!target) {
                setCompact(false);
                return;
            }
            const bottom = target.getBoundingClientRect().bottom;
            setCompact((was) => (was ? bottom < HEADER + 8 : bottom < HEADER));
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(check);
        };
        check();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        // Re-check after Inertia page visits and hot reloads redraw the page.
        const mo = new MutationObserver(schedule);
        mo.observe(document.body, { childList: true, subtree: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            mo.disconnect();
        };
    }, []);

    // Ignore hover-opening of menus right after the compact search is used.
    const hoverBlockedUntil = useRef(0);

    // Clicking the compact search scrolls back up and opens the first field of the big search.
    function unfold() {
        hoverBlockedUntil.current = Date.now() + 600;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        window.setTimeout(() => document.getElementById('search-level')?.focus(), reduce ? 0 : 450);
    }

    useEffect(() => {
        if (compact) close();
    }, [compact, close]);

    function triggerProps(id: MenuId) {
        return {
            ref: (el: HTMLButtonElement | null) => {
                triggerRefs.current[id] = el;
            },
            type: 'button' as const,
            'aria-expanded': current === id,
            'aria-controls': `menu-${id}`,
            className: 'tm-trigger',
            onPointerEnter: (e: React.PointerEvent) => {
                if (e.pointerType === 'mouse' && Date.now() > hoverBlockedUntil.current) open(id);
            },
            onClick: () => (currentRef.current === id ? close() : open(id)),
        };
    }

    const user = (auth.user as MenuUser | null) ?? null;

    return (
        <>
        <header
            className={`fixed inset-x-0 top-0 z-40 border-b bg-page transition-[border-color,box-shadow] duration-300 ${compact ? 'border-[#E7DFD3] shadow-[0_1px_12px_rgba(31,41,51,0.06)]' : 'border-stone'}`}
        >
            <div ref={barRef} className="relative mx-auto grid h-[76px] max-w-[1400px] grid-cols-[1fr_auto] items-center px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
                <Link href="/" className="tm-fade-down flex items-center gap-2 justify-self-start rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
                    <AppLogoIcon className="h-7 w-7 fill-current text-forest" />
                    <span className="font-display text-xl font-semibold text-charcoal">TrekMitra</span>
                </Link>

                {/* Centre: the menu, swapped for the compact search once the hero search scrolls away. */}
                <div className="relative hidden lg:block">
                {/* Desktop menu. The dropdown sits inside <nav> so leaving the nav covers links and panel. */}
                <nav
                    ref={navRef}
                    aria-label="Main"
                    aria-hidden={compact}
                    className={`tm-fade transition-opacity duration-200 ${compact ? 'pointer-events-none invisible opacity-0' : 'opacity-100'}`}
                    onPointerEnter={() => window.clearTimeout(closeTimer.current)}
                    onPointerLeave={(e) => {
                        if (e.pointerType === 'mouse') scheduleClose();
                    }}
                    onBlur={(e) => {
                        if (!navRef.current?.contains(e.relatedTarget as Node)) scheduleClose(0);
                    }}
                >
                    <ul className="flex items-center gap-7">
                        <li>
                            <button {...triggerProps('treks')}>
                                Treks <Chevron />
                            </button>
                        </li>
                        <li>
                            <button {...triggerProps('ways')}>
                                Ways to trek <Chevron />
                            </button>
                        </li>
                        <li>
                            <button {...triggerProps('regions')}>
                                Regions <Chevron />
                            </button>
                        </li>
                        <li>
                            <Link
                                href="/safety/altitude-sickness"
                                className="tm-trigger"
                                onPointerEnter={(e) => {
                                    if (e.pointerType === 'mouse') scheduleClose(60);
                                }}
                            >
                                Safety
                            </Link>
                        </li>
                    </ul>

                    <div ref={ddRef} className="tm-dd">
                        {/* Treks by level: list on the left, photo crossfade on the right */}
                        <div
                            id="menu-treks"
                            ref={(el) => {
                                panelRefs.current.treks = el;
                            }}
                            className="tm-panel grid w-[640px] grid-cols-[250px_1fr]"
                        >
                            <div className="flex flex-col gap-0.5 p-2">
                                {levels.map((level, i) => (
                                    <Link
                                        key={level.value}
                                        href={`/treks?level=${level.value}`}
                                        className={`flex flex-1 flex-col justify-center rounded-[6px] px-3 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-forest ${activeLevel === i ? 'bg-secondary/50' : ''}`}
                                        onPointerEnter={() => setActiveLevel(i)}
                                        onFocus={() => setActiveLevel(i)}
                                    >
                                        <strong className="text-[15px] font-semibold text-charcoal">{levelLabels[level.value]}</strong>
                                        <span className="mt-1 text-[13px] leading-snug text-slate">{levelLines[level.value]}</span>
                                        <span className="mt-1 text-xs font-semibold text-forest">
                                            {level.trek_count === 1 ? '1 trek' : `${level.trek_count} treks`}
                                        </span>
                                    </Link>
                                ))}
                                <Link href="/treks" className="mt-1 rounded-[6px] px-3 py-2 text-[13px] font-semibold text-forest hover:underline hover:underline-offset-4">
                                    All treks
                                </Link>
                            </div>
                            <div className="tm-media relative min-h-[300px] overflow-hidden rounded-r-[11px] bg-mint" aria-hidden="true">
                                {levels.map((level, i) =>
                                    level.photo_url ? <img key={level.value} src={level.photo_url} alt="" className={activeLevel === i ? 'is-active' : ''} /> : null,
                                )}
                            </div>
                        </div>

                        {/* Ways to trek */}
                        <div
                            id="menu-ways"
                            ref={(el) => {
                                panelRefs.current.ways = el;
                            }}
                            className="tm-panel flex w-[400px] flex-col gap-0.5 p-2"
                        >
                            {ways.map((way) => (
                                <Link
                                    key={way.title}
                                    href="/treks"
                                    className="rounded-[6px] px-3 py-3 transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-forest"
                                >
                                    <strong className="block text-[15px] font-semibold text-charcoal">{way.title}</strong>
                                    <span className="mt-1 block text-[13px] leading-snug text-slate">{way.text}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Regions: states that have published treks */}
                        <div
                            id="menu-regions"
                            ref={(el) => {
                                panelRefs.current.regions = el;
                            }}
                            className="tm-panel flex w-[260px] flex-col gap-0.5 p-2"
                        >
                            {states.map((state) => (
                                <Link
                                    key={state.name}
                                    href={`/treks?state=${encodeURIComponent(state.name)}`}
                                    className="flex items-center justify-between rounded-[6px] px-3 py-2.5 text-[15px] text-charcoal transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-forest"
                                >
                                    {state.name}
                                    <span className="text-xs text-slate">{state.trek_count}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>
                <CompactSearch visible={compact} onExpand={unfold} />
                </div>

                <div className="tm-fade-down flex items-center gap-2 justify-self-end" style={{ animationDelay: '550ms' }}>
                    <div className="hidden lg:block">
                        <AccountMenu user={user} />
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-page text-charcoal hover:bg-secondary/50 lg:hidden focus-visible:outline-2 focus-visible:outline-forest"
                        aria-label={sheetOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={sheetOpen}
                        aria-controls="mobile-sheet"
                        onClick={() => setSheetOpen(!sheetOpen)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                            <path d={sheetOpen ? 'M3.5 3.5l9 9M12.5 3.5l-9 9' : 'M2 5.5h12M2 10.5h12'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Mobile sheet */}
                <div id="mobile-sheet" className={`tm-sheet lg:hidden ${sheetOpen ? 'open' : ''}`}>
                    <MobileGroup title="Treks">
                        {levels.map((level) => (
                            <SheetLink key={level.value} href={`/treks?level=${level.value}`} onClick={() => setSheetOpen(false)}>
                                {levelLabels[level.value]} treks
                            </SheetLink>
                        ))}
                        <SheetLink href="/treks" onClick={() => setSheetOpen(false)}>
                            All treks
                        </SheetLink>
                    </MobileGroup>
                    <MobileGroup title="Regions">
                        {states.map((state) => (
                            <SheetLink key={state.name} href={`/treks?state=${encodeURIComponent(state.name)}`} onClick={() => setSheetOpen(false)}>
                                {state.name}
                            </SheetLink>
                        ))}
                    </MobileGroup>
                    <MobileGroup title="Safety">
                        <SheetLink href="/safety/altitude-sickness" onClick={() => setSheetOpen(false)}>
                            Altitude sickness guide
                        </SheetLink>
                    </MobileGroup>
                    <MobileGroup title={user ? user.name : 'Account'}>
                        {user ? (
                            <>
                                {user.role === 'guide' ? (
                                    <SheetLink href="/guide/dashboard" onClick={() => setSheetOpen(false)}>
                                        Guide dashboard
                                    </SheetLink>
                                ) : user.role === 'admin' ? (
                                    <SheetLink href="/admin" onClick={() => setSheetOpen(false)}>
                                        Admin panel
                                    </SheetLink>
                                ) : (
                                    <>
                                        <SheetLink href="/account/bookings" onClick={() => setSheetOpen(false)}>
                                            My bookings
                                        </SheetLink>
                                        <SheetLink href="/account/profile" onClick={() => setSheetOpen(false)}>
                                            Profile
                                        </SheetLink>
                                    </>
                                )}
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="block w-full rounded-[6px] px-3 py-2.5 text-left text-[15px] text-charcoal hover:bg-secondary/50"
                                >
                                    Log out
                                </Link>
                            </>
                        ) : (
                            <>
                                <SheetLink href="/login" onClick={() => setSheetOpen(false)}>
                                    Log in
                                </SheetLink>
                                <SheetLink href="/register" onClick={() => setSheetOpen(false)}>
                                    Sign up
                                </SheetLink>
                                <SheetLink href="/register?as=guide" onClick={() => setSheetOpen(false)}>
                                    Become a guide
                                </SheetLink>
                            </>
                        )}
                    </MobileGroup>
                </div>
            </div>

        </header>

        {/* The header is fixed; this keeps the page from sliding under it. */}
        <div aria-hidden="true" className="h-[77px]" />
        </>
    );
}

function MobileGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="mx-3 mt-3 mb-1.5 text-xs font-semibold tracking-[0.06em] text-slate uppercase">{title}</h3>
            {children}
        </div>
    );
}

function SheetLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link href={href} onClick={onClick} className="block rounded-[6px] px-3 py-2.5 text-[15px] text-charcoal hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-forest">
            {children}
        </Link>
    );
}
