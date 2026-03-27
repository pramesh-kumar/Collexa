import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/auth": "http://localhost:5000",
      "/profile": "http://localhost:5000",
      "/users": "http://localhost:5000",
      "/swipe": "http://localhost:5000",
      "/matches": "http://localhost:5000",
      "/chat": "http://localhost:5000",
    },
  },
});
