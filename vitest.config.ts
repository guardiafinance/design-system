/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./ui_kit', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    include: ['ui_kit/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['ui_kit/**/*.{ts,tsx}'],
      exclude: [
        'ui_kit/**/*.stories.tsx',
        'ui_kit/**/*.test.{ts,tsx}',
        'ui_kit/**/*.d.ts',
        'ui_kit/index.tsx',
      ],
      thresholds: {
        // FIXME: raise back to 70% once Radix components have tests
        lines: 25,
        functions: 25,
        branches: 25,
        statements: 25,
      },
    },
  },
} as never);
