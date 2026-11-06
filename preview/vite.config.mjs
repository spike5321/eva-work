import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    // Editor atomic-write scratch dirs and large binary fonts lock on Windows and crash chokidar.
    watch: { ignored: ["**/*.tmpdir/**", "**/*.tmp", "**/*.ttf", "**/*.otf"] },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
