import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/main.jsx',
        'eslint.config.js',
        '**/*.css'
      ],
      include: [
        'src/**/*.{js,jsx,ts,tsx}'
      ]
    },
    transformMode: {
      web: [/\.[jt]sx?$/]
    }
  },
})
