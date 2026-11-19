import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import type { ClosingPhoto } from '@/types/trek';
import type { ReactNode } from 'react';

/** Layout for public, trekker and guide pages (not Filament). */
export default function PublicLayout({
    children,
    closing,
    search,
}: {
    children: ReactNode;
    closing?: ClosingPhoto | null;
    /** Pass on the home page to show the big search bar in the header. */
    search?: { cities: string[] };
}) {
    return (
        <div className="flex min-h-screen flex-col bg-page font-sans text-charcoal antialiased">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[4px] focus:bg-surface focus:px-4 focus:py-2">
                Skip to content
            </a>
            <SiteHeader search={search} />
            <main id="main" className="flex-1">
                {children}
            </main>
            <SiteFooter closing={closing} />
        </div>
    );
}
