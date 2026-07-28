import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve(process.cwd(), "github-pages"),
  base: "/portfolio/",
  publicDir: resolve(process.cwd(), "public"),
  plugins: [react()],
  build: {
    outDir: resolve(process.cwd(), "gh-pages-dist"),
    emptyOutDir: true,
  },
});
