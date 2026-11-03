import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DemoBanner } from './DemoBanner';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { CartDrawer } from './CartDrawer';

// Scroll to a #section after route changes (React Router does not do this).
function useHashScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [pathname, hash]);
}

export function ShopLayout() {
  useHashScroll();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
        Skip to content
      </a>
      <DemoBanner />
      <SiteHeader />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
