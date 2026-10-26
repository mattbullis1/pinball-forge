import {defineConfig} from 'vite';
import {playerBundlePlugin} from './scripts/build-player.mjs';
export default defineConfig({base:'./',plugins:[playerBundlePlugin()],server:{allowedHosts:['example.test']},build:{outDir:'dist'}});
