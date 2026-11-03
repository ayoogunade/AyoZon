import { useEffect } from 'react';

// Fades in [data-reveal] elements as they enter the viewport. Content stays visible if this never runs.
export function useReveal(deps = []) {
  useEffect(() => {
    document.documentElement.classList.add('js');
    const els = document.querySelectorAll('[data-reveal]:not(.is-shown)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-shown'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-shown');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
