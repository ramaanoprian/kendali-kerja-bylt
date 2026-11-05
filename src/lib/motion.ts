import { useEffect, useRef, useState } from 'react';

/** True when the user asked the OS for less motion. Evaluated per call so tests can toggle it. */
export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Animates from the previously shown value to `value`. The final value is always rendered exactly. */
export function useCountUp(value: number, duration = 900) {
  const [shown, setShown] = useState(() => (reducedMotion() ? value : 0));
  // The number currently on screen; a new target animates from here, so interrupted runs never jump.
  const current = useRef(shown);
  useEffect(() => {
    if (reducedMotion() || typeof requestAnimationFrame !== 'function') { setShown(value); current.current = value; return; }
    const start = performance.now(), origin = current.current;
    if (origin === value) return;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = Math.round(origin + (value - origin) * easeOutExpo(t));
      current.current = next; setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return shown;
}

/**
 * Reveals `[data-reveal]` elements when they scroll into view.
 * Content stays visible without JS: the hidden state only applies once `html.reveal-ready` is set here.
 */
export function useReveal(dependency: unknown) {
  useEffect(() => {
    const root = document.documentElement;
    const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)')];
    if (reducedMotion() || typeof IntersectionObserver !== 'function') { items.forEach(el => el.classList.add('is-visible')); return; }
    root.classList.add('reveal-ready');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [dependency]);
}

/**
 * For horizontally scrolling rows (tabs, kanban): marks which edges hide more content so CSS can fade them,
 * and keeps the selected item in view when `active` changes. Returns a ref callback.
 */
export function useScrollHint<T extends HTMLElement>(active?: unknown) {
  const [el, setEl] = useState<T | null>(null);
  useEffect(() => {
    if (!el) return;
    el.dataset.scrollHint = '';
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.toggleAttribute('data-more-start', el.scrollLeft > 2);
      el.toggleAttribute('data-more-end', max - el.scrollLeft > 2);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => { el.removeEventListener('scroll', update); ro?.disconnect(); };
  }, [el]);
  useEffect(() => {
    if (!el) return;
    const current = el.querySelector<HTMLElement>('[aria-pressed="true"],[aria-selected="true"]');
    if (!current || el.scrollWidth <= el.clientWidth) return;
    const er = el.getBoundingClientRect(), cr = current.getBoundingClientRect();
    const left = el.scrollLeft + (cr.left - er.left) - (el.clientWidth - cr.width) / 2;
    el.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [el, active]);
  return setEl;
}
