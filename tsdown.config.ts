import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2021',
  // Ensure outputs match existing package.json conventions:
  // - ESM: dist/index.js
  // - CJS: dist/index.cjs
  outExtension({ format }) {
    return format === 'cjs' ? '.cjs' : '.js'
  },
})
