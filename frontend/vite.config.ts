import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, `${process.cwd()}/../`);

  return {
    define: {
      'process.env.HOST_DOMAIN': JSON.stringify(env.VITE_HOST_DOMAIN),
    },
    plugins: [react(), tailwindcss()],
  }
})
