import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { Link } from '@inertiajs/react';

export default function AuthGlassLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh bg-[#F7F6F0] font-sans text-[#174C3C] antialiased lg:grid-cols-[1.1fr_1fr]">

            {/* Photo panel */}
            <aside className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:block lg:h-svh">
                <img
                    src="/image/auth-trek.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#102F26]/90 via-[#174C3C]/15 to-[#102F26]/10" />

                <Link
                    href={home()}
                    className="absolute top-8 left-10 inline-flex items-center gap-2.5 rounded-lg text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                    <AppLogoIcon className="h-7 w-7 fill-current" />
                    <span className="font-display text-lg font-semibold tracking-wide">
                        TrekMitra
                    </span>
                </Link>

                <div className="absolute right-10 bottom-10 left-10 text-white">
                    <p className="max-w-md font-display text-[30px] leading-snug font-semibold">
                        Discover new trails. Create unforgettable memories.
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                        <span className="h-px w-8 bg-[#D6B783]" />
                        <p className="text-sm tracking-wide text-white/80">
                            Hampta Pass, Himachal Pradesh
                        </p>
                    </div>
                </div>
            </aside>

            {/* Form side — soft radial light so the card has something to sit on */}
            <div className="flex flex-col bg-[#F7F6F0] bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,#FFFFFF_0%,#F7F6F0_70%)] px-5 py-8 sm:px-12">

                <Link
                    href={home()}
                    className="inline-flex items-center gap-2.5 self-start rounded-lg text-[#174C3C] lg:hidden"
                >
                    <AppLogoIcon className="h-7 w-7 fill-current" />
                    <span className="font-display text-lg font-semibold">
                        TrekMitra
                    </span>
                </Link>

                <main className="flex flex-1 items-center justify-center py-6 lg:py-10">
                    <div className="relative w-full max-w-[460px]">

                        {/* Ground shadow */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-10 -bottom-6 h-10 rounded-[50%] bg-[#102F26]/20 blur-2xl"
                        />

                        {/* Back sheet (deepest) */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-8 top-8 -bottom-4 rounded-[28px] border border-[#174C3C]/10 bg-[#E9EEE7] shadow-[0_8px_20px_-8px_rgba(16,47,38,0.18)]"
                        />

                        {/* Middle sheet */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-4 top-4 -bottom-2 rounded-[26px] border border-[#174C3C]/10 bg-[#F4F2EA] shadow-[0_6px_14px_-6px_rgba(16,47,38,0.16)]"
                        />

                        {/* Front card */}
                        <div className="relative rounded-3xl border border-white bg-gradient-to-b from-white to-[#FBFAF5] px-6 py-9 ring-1 ring-[#174C3C]/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_0_rgba(23,76,60,0.05),0_1px_2px_rgba(16,47,38,0.06),0_8px_16px_-4px_rgba(16,47,38,0.08),0_24px_48px_-12px_rgba(16,47,38,0.22)] sm:px-10">

                            {/* Top-edge sheen */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D6B783]/70 to-transparent"
                            />

                            <div className="mb-3 h-1 w-10 rounded-full bg-[#B58B55] shadow-[0_1px_2px_rgba(161,122,72,0.4)]" />

                            <h1 className="font-display text-[32px] leading-tight font-semibold tracking-tight text-[#174C3C]">
                                {title}
                            </h1>

                            {description && (
                                <p className="mt-2 text-[15px] leading-relaxed text-[#65736B]">
                                    {description}
                                </p>
                            )}

                            <div className="mt-8">
                                {children}
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="text-xs text-[#849087]">
                    © {new Date().getFullYear()} TrekMitra
                </footer>
            </div>
        </div>
    );
}
