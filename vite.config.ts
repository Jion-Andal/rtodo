import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // './' for local preview; '/rtodo/' for GitHub Pages (set in CI via VITE_BASE_PATH)
  base: process.env.VITE_BASE_PATH ?? './',
})
