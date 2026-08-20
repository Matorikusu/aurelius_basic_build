import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { aureliusApiPlugin } from "./proxy.mjs";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), aureliusApiPlugin()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
});
