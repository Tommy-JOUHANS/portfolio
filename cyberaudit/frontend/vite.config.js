import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.js"],
    // Exclut les tests emails (composants React Email pas encore créés)
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src/__tests__/emails/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "src/main.jsx",
        "*.config.*",
        "dist/**",
        "emails/**",
      ],
    },
  },
});
