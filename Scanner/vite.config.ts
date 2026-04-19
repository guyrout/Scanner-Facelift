import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /** Bind all interfaces so Simple Browser / tunnels / LAN can reach the dev server. */
    host: true,
    port: 5173,
    /** If 5173 is already taken (another Vite tab), use the next free port instead of failing. */
    strictPort: false,
  },
})
