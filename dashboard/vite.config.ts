import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // Relative paths so the build serves from a GitHub Pages subpath or a domain root.
  base: "./",
  plugins: [react(), tailwindcss()],
})
