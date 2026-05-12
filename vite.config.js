import { defineConfig } from "vite";

export default defineConfig({
  root: "client",
  publicDir: "../public",
  server: {
    host: true,
    port: 4173,
    proxy: {
      "/api": "http://localhost:3101"
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  preview: {
    host: true
  }
});
