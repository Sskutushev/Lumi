import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": "/src",
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'supabase-vendor': ['@supabase/supabase-js'],
                    'ui-vendor': ['framer-motion', 'lucide-react', 'sonner']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
});
