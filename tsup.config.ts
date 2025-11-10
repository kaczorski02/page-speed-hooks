import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'web-vitals': 'src/web-vitals/index.ts',
    media: 'src/media/index.ts',
    resources: 'src/resources/index.ts',
    network: 'src/network/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false, // Let consuming bundlers minify
  external: ['react', 'react-dom', 'web-vitals'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"', // Next.js App Router compatibility
    }
  },
})
