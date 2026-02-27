import { defineConfig } from "vite";

export default defineConfig({
  base: "/FourierAndEpicylcles/",
  server: {
    port: 5173,
    open: true,
  },

  build: {
    target: "esnext",
    outDir: "dist",
    rootDir: ".",
    sourcemap: false,
    emptyOutDir: true,
  },
});
