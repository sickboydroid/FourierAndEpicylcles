import { defineConfig } from "vite";

export default defineConfig({
  base: "/FourierAndEpicylcles/",
  server: {
    port: 5173,
    open: true,
  },
  
  build: {
    rootDir: ".",
    target: "esnext",
    outDir: "dist",
    sourcemap: false,
    emptyOutDir: true,
  },
});
