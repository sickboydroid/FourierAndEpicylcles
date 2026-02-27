import { defineConfig } from "vite";

export default defineConfig({
  base: "/FourierAndEpicylcles/",
  rootDir: ".",
  server: {
    port: 5173,
    open: true,
  },

  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
  },
});
