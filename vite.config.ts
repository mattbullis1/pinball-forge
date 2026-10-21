import { defineConfig } from 'vite';
export default defineConfig({ base: './', server: { allowedHosts: ['example.test'] }, build: { outDir: 'dist' } });
