import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte()],

  // Optimize build configuration
  build: {
    target: 'es2015', // Ensure broader browser compatibility
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        passes: 2 // Multiple optimization passes
      }
    },
    // Split Three.js into separate chunks for better caching and loading
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'app': ['./src/App.svelte']
        }
      }
    },
    // Better asset handling
    assetsInlineLimit: 4096, // Only inline small files (4kb or less)
    cssCodeSplit: true
  },

  // Optimize dependencies - compatible with Vite v3
  optimizeDeps: {
    include: ['three'], // Pre-bundle Three.js for faster development
    exclude: [] // Add any dependencies that shouldn't be pre-bundled
  },

  // Configure server for development
  server: {
    headers: {
      'Cache-Control': 'max-age=0, must-revalidate' // Don't cache during development
    }
  },

  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})