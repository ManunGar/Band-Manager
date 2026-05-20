import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/controllers/**', 'src/middleware/**'],
      exclude: ['src/models/**', 'src/database/**', 'src/config/**']
    }
  }
});
