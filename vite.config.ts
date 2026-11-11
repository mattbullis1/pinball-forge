import {defineConfig,loadEnv} from 'vite';
import {playerBundlePlugin} from './scripts/build-player.mjs';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'PINBALL_');
 const allowedHosts=(env.PINBALL_DEV_ALLOWED_HOSTS??'').split(',').map(host=>host.trim()).filter(Boolean);
 return {base:'./',plugins:[playerBundlePlugin()],server:{allowedHosts},build:{outDir:'dist'}};
});
