import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// jest-axe matcher para WCAG asserts nos testes de componente (Tech Task #125).
// Estende `expect` no setup pra `toHaveNoViolations()` ficar disponivel sem
// import por teste. Helper de tema vive em `ui_kit/test-utils/a11y.ts`.
expect.extend(toHaveNoViolations);

// Clean up the DOM after every test
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement these; components that use them need a stub
if (typeof window !== 'undefined') {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as never;

  if (!('ResizeObserver' in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!('IntersectionObserver' in window)) {
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    };
  }

  // jsdom does not implement the Pointer Capture API. Radix primitives that
  // implement swipe gestures (e.g. @radix-ui/react-toast) call
  // hasPointerCapture / setPointerCapture / releasePointerCapture inside
  // pointer event handlers and throw when the methods are missing. Stub them
  // as no-ops so component tests can dispatch pointer events without crashing.
  const elementProto = window.Element?.prototype as unknown as Record<
    string,
    unknown
  >;
  if (elementProto && typeof elementProto.hasPointerCapture !== 'function') {
    elementProto.hasPointerCapture = function hasPointerCapture(): boolean {
      return false;
    };
    elementProto.setPointerCapture = function setPointerCapture(): void {};
    elementProto.releasePointerCapture = function releasePointerCapture(): void {};
  }

  // jsdom does not implement Element.prototype.scrollIntoView. cmdk
  // (Command primitive — see ADR-017) calls scrollIntoView on the
  // active item to keep it visible when keyboard navigation moves
  // the highlight. Stub it as a no-op so the Command tests can
  // render and interact without crashing inside cmdk's selection
  // effect.
  if (elementProto && typeof elementProto.scrollIntoView !== 'function') {
    elementProto.scrollIntoView = function scrollIntoView(): void {};
  }
}
