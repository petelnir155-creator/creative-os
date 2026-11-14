import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// No proxy needed any more: the browser talks to Supabase, and the Supabase Edge Function talks to Anthropic.
export default defineConfig({ plugins: [react(), tailwindcss()] })
