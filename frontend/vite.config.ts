import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: true,
    proxy: {
      "/threads": "http://localhost:8000",
      "/health": "http://localhost:8000",
    },
  },
});
