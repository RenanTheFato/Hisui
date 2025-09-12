import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/tests/**/*.ts'],
    env: {
      NODE_ENV: 'test'
    },
    setupFiles: ['./vitest.setup.ts']
  },
})