import { defineConfig } from 'vite';

export default defineConfig({
  // esbuild a pure ts project, will not check ts, so it is faster
  // and the ide and tsc check the types
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
