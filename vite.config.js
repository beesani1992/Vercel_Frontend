import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Map standard Vercel ENV variables to import.meta.env
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || process.env.SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    },
  };
});
